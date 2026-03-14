import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request & { user: User }>();
  const user: User = req.user;

  if (!user) {
    throw new InternalServerErrorException('User not found in request');
  }
  return req.user;
});
