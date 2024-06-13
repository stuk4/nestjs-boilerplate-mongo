import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { RefreshToken } from './schemas/refresh-token.schema';
import { User, UserDocument } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async signUp(signupDto: SignupDto) {
    const { email, password, name } = signupDto;
    try {
      // Check if email is in use
      const emailInUse = await this.userModel.exists({
        email: signupDto.email,
      });

      if (emailInUse) {
        throw new ConflictException('Email  already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await this.userModel.create({
        email,
        password: hashedPassword,
        name,
      });

      return {
        email: createdUser.email,
        name: createdUser.name,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        this.logger.error(error.message);
        throw new InternalServerErrorException('Error signing up');
      }
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.log(`User ${user._id} logged in`);
      const tokens = await this.generateUserToken(user._id as string);
      return {
        user: {
          email: user.email,
          name: user.name,
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
  async refreshToken(refreshToken: string) {
    try {
      const token = await this.refreshTokenModel.findOneAndDelete({
        token: refreshToken,
        expiresAt: { $gt: new Date() },
      });
      if (!token) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateUserToken(token.userId.toString());
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Error refreshing token');
    }
  }

  private async generateUserToken(userId: string) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(token: string, userId: string) {
    const expireAt = new Date();
    // Set the expiration date to 3 days from now
    expireAt.setDate(expireAt.getDate() + 3);
    await this.refreshTokenModel.create({ token, userId, expiresAt: expireAt });
  }
}
