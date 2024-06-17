import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OauthService } from './oauth.service';
import { ExchangeCodeDto } from './dtos/exchange-code.dto';
import { Response } from 'express';
import { AuthenticatedGoogleRequest } from './interfaces';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oAuthService: OauthService) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @Req() req: AuthenticatedGoogleRequest,
    @Res() res: Response,
  ) {
    return this.oAuthService.googleLogin(req, res);
  }
  @Post('exchange-code')
  async exchangeCode(@Body() exchangeCodeDto: ExchangeCodeDto) {
    return this.oAuthService.exchangeCode(exchangeCodeDto);
  }
}
