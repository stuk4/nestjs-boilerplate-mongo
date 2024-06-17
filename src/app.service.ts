import { Injectable } from '@nestjs/common';
import { IpcService as IpcAnnualService } from './central-bank/ipc.service';

@Injectable()
export class AppService {
  constructor(private readonly ipcAnnualService: IpcAnnualService) {}
  async getHello() {
    const data = await this.ipcAnnualService.getHistoricalAnnualIpc();
    return data;
  }
}
