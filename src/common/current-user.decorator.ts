import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// helper factory exposed for testing so we can call the logic without
// invoking Nest's decorator mechanism (which tries to read a constructor).
export const currentUserFactory = (_data: unknown, ctx: ExecutionContext): { id: string } => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
