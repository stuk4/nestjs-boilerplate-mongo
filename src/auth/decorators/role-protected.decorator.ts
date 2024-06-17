import { SetMetadata } from '@nestjs/common';
import { EnumRole } from '../interfaces';

export const META_ROLES_KEY = 'roles';

export const RoleProtected = (...args: EnumRole[]) => {
  return SetMetadata(META_ROLES_KEY, args);
};
