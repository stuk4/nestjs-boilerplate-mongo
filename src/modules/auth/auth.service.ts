import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { RefreshToken } from './schemas/refresh-token.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import { Profile, ProfileDocument } from '../user/schemas/profile.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,

    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async signUp(signupDto: SignupDto) {
    const { email, password, username, fullName } = signupDto;
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      // Check if email is in use
      const emailInUse = await this.userModel.exists({
        email: signupDto.email,
      });

      if (emailInUse) {
        throw new ConflictException('Email  already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const createdProfile = await this.profileModel.create(
        [
          {
            username,
            bio: '',
            gender: null,
            inactiveReason: '',
            avatarUrl: '',
          },
        ],
        { session },
      );

      const createdUser = await this.userModel.create(
        [
          {
            email,
            password: hashedPassword,
            username,
            fullName,
            ipAddresses: [],
            profile: createdProfile[0]._id,
          },
        ],
        { session },
      );
      await session.commitTransaction();
      session.endSession();

      return {
        email: createdUser[0].email,
        username: createdUser[0].username,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof ConflictException) {
        throw error;
      } else {
        this.logger.error(`ERROR CREATING USER ${error.message}`);
        throw new InternalServerErrorException('Error signing up');
      }
    }
  }

  async login(loginDto: LoginDto, ip: string) {
    const { email, password } = loginDto;
    this.logger.log(`User ${email} logging in from ${ip}`);
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (user.ipAddresses.length === 10) {
        user.ipAddresses.shift();
      }

      user.ipAddresses.push(ip);
      await user.save();

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.log(`User ${user._id} logged in`);
      const tokens = await this.generateUserToken(
        user._id as mongoose.Types.ObjectId,
      );
      return {
        user: {
          email: user.email,
          username: user.username,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error(error.message);
        throw new InternalServerErrorException('Error logging in');
      }
    }
  }

  async refreshToken(refreshToken: string, userId: string) {
    try {
      const tokenDoc = await this.refreshTokenModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        expiresAt: { $gt: new Date() },
      });
      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const tokenMatch = await bcrypt.compare(refreshToken, tokenDoc.token);
      if (!tokenMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateUserToken(tokenDoc.userId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Error refreshing token');
    }
  }

  async generateUserToken(userId: mongoose.Types.ObjectId) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(
    token: string,
    userId: mongoose.Types.ObjectId,
  ) {
    const expireAt = new Date();

    expireAt.setDate(expireAt.getDate() + 3);
    const hashedToken = await bcrypt.hash(token, 10);

    await this.refreshTokenModel.updateOne(
      {
        userId,
      },
      {
        $set: {
          token: hashedToken,
          expiresAt: expireAt,
        },
      },
      {
        upsert: true,
      },
    );
  }
}
