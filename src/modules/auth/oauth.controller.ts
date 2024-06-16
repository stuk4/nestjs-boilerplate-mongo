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

@Controller('oauth')
export class OauthController {
  constructor(private readonly oAuthService: OauthService) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    return this.oAuthService.googleLogin(req, res);
  }
  @Post('exchange-code')
  async exchangeCode(@Body() exchangeCodeDto: ExchangeCodeDto) {
    return this.oAuthService.exchangeCode(exchangeCodeDto);
  }
}
