import { Module } from '@nestjs/common';
import { IpcService } from './ipc.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('BCENTRAL_URL'),
        params: {
          user: configService.get<string>('BCENTRAL_USER'),
          pass: configService.get<string>('BCENTRAL_PASS'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IpcService],
  exports: [IpcService, HttpModule],
})
export class CentralBankModule {}
