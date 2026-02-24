import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser, currentUserFactory } from '../../common/current-user.decorator';

// simple fake context builder
function makeCtx(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
}

describe('CurrentUser decorator', () => {
  it('returns request.user object', () => {
    const ctx = makeCtx({ id: 'u1', foo: 'bar' });
    // call the underlying factory directly to avoid decorator metadata logic
    const result = currentUserFactory(null, ctx);
    expect(result).toEqual({ id: 'u1', foo: 'bar' });
  });

  it('handles missing user gracefully', () => {
    const ctx = makeCtx(undefined);
    const result = currentUserFactory(null, ctx);
    expect(result).toBeUndefined();
  });
});