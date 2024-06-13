import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
      return this.generateUserToken(user._id as string);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error(error.message);
        throw new InternalServerErrorException('Error logging in');
      }
    }
  }

  private async generateUserToken(userId: string) {
    const accessToken = this.jwtService.sign({ userId });
    return {
      accessToken,
    };
  }
}
