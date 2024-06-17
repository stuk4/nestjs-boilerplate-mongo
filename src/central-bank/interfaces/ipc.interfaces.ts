export interface IResponseBcentralIpcAnnual {
  Codigo: number;
  Descripcion: string;
  Series: IBcentralSeries;
  SeriesInfos: any[];
}

export interface IBcentralSeries {
  descripEsp: string;
  descripIng: string;
  seriesId: string;
  Obs: IBcentralIpcAnnual[];
}

export interface IBcentralIpcAnnual {
  indexDateString: string;
  value: string;
  statusCode: string;
}

export enum EnumBcentralSeries {
  annualVariatonIpc = 'F074.IPC.IND.Z.EP09.C.M',
}
