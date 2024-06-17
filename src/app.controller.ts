import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RoleProtected } from './auth/decorators';
import { UserDocument } from './user/schemas/user.schema';
import { EnumRole } from './auth/interfaces';
import { UserRoleGuard } from './auth/guards/user-role.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('private')
  testingPrivateRoute() {
    return this.appService.getHello();
  }
  @Get('private2')
  @RoleProtected(EnumRole.admin, EnumRole.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivate2Route(@GetUser() user: UserDocument) {
    return {
      ok: true,
      user,
    };
  }
  @Get('private3')
  @Auth(EnumRole.admin)
  testingPrivate3Route(@GetUser() user: UserDocument) {
    return {
      ok: true,
      user,
    };
  }
}
