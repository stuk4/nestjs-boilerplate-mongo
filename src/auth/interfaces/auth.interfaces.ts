import { Request } from 'express';
export enum EnumRole {
  admin = 'admin',
  user = 'user',
}

export interface AuthenticatedGoogleRequest extends Request {
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  };
}
