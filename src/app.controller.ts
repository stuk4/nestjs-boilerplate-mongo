import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './modules/auth/decorators/get-user.decorator';
import { UserDocument } from './modules/user/schemas/user.schema';
import { UserRoleGuard } from './modules/auth/guards/user-role.guard';
import { EnumRole } from './modules/auth/interfaces/auth.interfaces';
import { RoleProtected } from './modules/auth/decorators/role-protected.decorator';
import { Auth } from './modules/auth/decorators';

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
