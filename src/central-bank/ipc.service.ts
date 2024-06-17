import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import {
  EnumBcentralSeries,
  IResponseBcentralIpcAnnual,
} from './interfaces/ipc.interfaces';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class IpcService {
  private readonly logger = new Logger(IpcService.name);
  constructor(private readonly httpService: HttpService) {}

  async getHistoricalAnnualIpc() {
    const { data } = await firstValueFrom(
      this.httpService
        .get<IResponseBcentralIpcAnnual>(``, {
          params: {
            timeseries: EnumBcentralSeries.annualVariatonIpc,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new Error(error.message);
          }),
        ),
    );
    return data;
  }
}
