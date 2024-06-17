import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from './common/common.module';
import { EnvConfiguration } from './common/config';
import { JoiValidationSchema } from './common/config/joi.validation';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LogginMiddleware } from './common/middlewares';
import { CentralBankModule } from './central-bank/central-bank.module';
import { IpcService } from './central-bank/ipc.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      cache: true,
      isGlobal: true,
      validationSchema: JoiValidationSchema,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
        dbName: configService.get('MONGODB_NAME'),
      }),
    }),
    AuthModule,
    UserModule,
    CommonModule,
    CentralBankModule,
  ],
  controllers: [AppController],
  providers: [AppService, IpcService],
})
export class AppModule implements NestModule {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogginMiddleware).forRoutes('*');
  }
}
