import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogginMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Response');
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl: url } = req;
    const reqTime = new Date().getTime();
    res.on('finish', () => {
      const { statusCode } = res;
      const resTime = new Date().getTime();
      if (
        statusCode == 201 ||
        statusCode == 200 ||
        statusCode == 204 ||
        statusCode == 304
      ) {
        this.logger.log(
          `${method} ${url} ${statusCode} ${resTime - reqTime}ms`,
        );
      }
    });

    next();
  }
}
