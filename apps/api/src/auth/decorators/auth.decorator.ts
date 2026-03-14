import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';

export const META_ROLES = 'roles';

export const Auth = (...args: UserRole[]) => {
  return applyDecorators(
    SetMetadata(META_ROLES, args),
    UseGuards(AuthGuard('jwt'), RolesGuard),
  );
};
