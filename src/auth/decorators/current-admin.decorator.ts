import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedAdmin } from '../types/authenticated-admin.type';

type RequestWithAdmin = Request & {
  user: AuthenticatedAdmin;
};

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAdmin => {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();

    return request.user;
  },
);
