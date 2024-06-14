import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './modules/auth/decorators/get-user.decorator';
import { UserDocument } from './modules/auth/schemas/user.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(@GetUser() user: UserDocument) {
    return {
      message: `Hello world private`,
      user,
    };
  }
  @Get('private2')
  @UseGuards(AuthGuard())
  testingPrivate2Route(@GetUser() user: UserDocument) {
    return {
      ok: true,
      user,
    };
  }
}
