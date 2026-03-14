import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User, UserRole } from '@prisma/client';
import { META_ROLES } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.getAllAndOverride<UserRole[]>(
      META_ROLES,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest<Request & { user: User }>();
    const user: User = req.user;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    for (const role of user.role) {
      if (validRoles.includes(role)) {
        return true;
      }
    }
    throw new ForbiddenException('Insufficient permissions');
  }
}
