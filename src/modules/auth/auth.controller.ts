import { Body, Controller, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Auth, GetUser } from './decorators';
import { EnumRole } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signupDto: SignupDto) {
    return this.authService.signUp(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    return this.authService.login(loginDto, ip);
  }

  @Post('refresh')
  @Auth(EnumRole.user)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetUser('_id') userId: string,
  ) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken, userId);
  }
}
