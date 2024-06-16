import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { generateRandomString } from './utils/generate-random-string';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  AuthorizationCode,
  AuthorizationCodeDocument,
} from './schemas/authorization-code.schema';
import { ExchangeCodeDto } from './dtos/exchange-code.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthenticatedGoogleRequest } from './interfaces';

@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AuthorizationCode.name)
    private authorizationCodeModel: Model<AuthorizationCodeDocument>,
    private readonly authService: AuthService,
  ) {}

  async googleLogin(req: AuthenticatedGoogleRequest, res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      let user = await this.userModel.findOne({ email: req.user.email });
      if (!user) {
        const randomPassword = generateRandomString(32); // Generar una contraseña aleatoria
        const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hashear la contraseña aleatoria

        user = new this.userModel({
          email: req.user.email,
          fullName: `${req.user.firstName} ${req.user.lastName}`,
          username: req.user.email.split('@')[0],
          password: hashedPassword,
        });
        await user.save();
        this.logger.log(`New user created: ${user._id}`);
      }

      const authorizationCode = await this.generateAuthorizationCode(
        user._id as mongoose.Types.ObjectId,
      );
      this.logger.debug(`Authorization code: ${authorizationCode}`);
      res.redirect(`http://localhost:3000/auth?code=${authorizationCode}`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        this.logger.error(error.message);
        throw new InternalServerErrorException('Error logging in');
      }
    }
  }

  async generateAuthorizationCode(userId: mongoose.Types.ObjectId) {
    const code = uuidv4();

    await this.storeAuthorizationCode(code, userId);

    return code;
  }

  private async storeAuthorizationCode(
    code: string,
    userId: mongoose.Types.ObjectId,
  ) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Código válido por 10 minutos
    try {
      await this.authorizationCodeModel.updateOne(
        { userId },
        { $set: { code, userId, expiresAt } },
        { upsert: true },
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        'Error creating authorization code',
      );
    }
  }

  async exchangeCode(exchangeCodeDto: ExchangeCodeDto) {
    const { code } = exchangeCodeDto;
    const authorizationCode = await this.authorizationCodeModel.findOne({
      code,
    });

    if (!authorizationCode || authorizationCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }
    const userId = authorizationCode.userId;
    await authorizationCode.deleteOne();
    if (!userId) {
      throw new UnauthorizedException('Invalid authorization code');
    }
    const tokens = await this.authService.generateUserToken(userId);
    return tokens;
  }
}
