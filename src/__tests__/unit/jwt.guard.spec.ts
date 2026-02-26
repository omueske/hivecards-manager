import { JwtGuard, truncate } from '../../common/jwt.guard';
import { Reflector } from '@nestjs/core';

describe('JwtGuard (unit)', () => {
  let guard: JwtGuard;
  let verifyMock: jest.Mock;

  const makeCtx = (header?: string) => {
    const handler = () => undefined;
    class CtxClass {}
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: header } }),
      }),
      getHandler: () => handler,
      getClass: () => CtxClass,
    } as any;
  };

  beforeEach(() => {
    verifyMock = jest.fn();
    guard = new JwtGuard({ verifyToken: verifyMock } as any, new Reflector());
  });

  it('denies when header missing', async () => {
    expect(await guard.canActivate(makeCtx(undefined))).toBe(false);
  });

  it('denies when header malformed', async () => {
    expect(await guard.canActivate(makeCtx('BearerTokenOnly'))).toBe(false);
  });

  it('malformed header with long string triggers truncation', async () => {
    const long = 'Bearer ' + 'a'.repeat(20);
    const spy = jest.spyOn((guard as any).logger, 'warn');
    expect(await guard.canActivate(makeCtx(long))).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('...'));
  });

  it('denies when token invalid', async () => {
    verifyMock.mockReturnValue(null);
    expect(await guard.canActivate(makeCtx('Bearer abc'))).toBe(false);
  });

  it('allows and attaches user when token valid', async () => {
    verifyMock.mockReturnValue({ sub: 'user123', role: 'user' });
    const req: any = { headers: { authorization: 'Bearer xyz' } };
    const handler = () => undefined;
    class CtxClass {}
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => handler,
      getClass: () => CtxClass,
    } as any;
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({ id: 'user123', role: 'user' });
  });

  it('denies when role requirement is not met', async () => {
    verifyMock.mockReturnValue({ sub: 'user123', role: 'user' });
    jest.spyOn((guard as any).reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const req: any = { headers: { authorization: 'Bearer xyz' } };
    const handler = () => undefined;
    class CtxClass {}
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => handler,
      getClass: () => CtxClass,
    } as any;
    expect(await guard.canActivate(ctx)).toBe(false);
  });

  it('allows when role requirement is met', async () => {
    verifyMock.mockReturnValue({ sub: 'admin1', role: 'admin' });
    jest.spyOn((guard as any).reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const req: any = { headers: { authorization: 'Bearer xyz' } };
    const handler = () => undefined;
    class CtxClass {}
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => handler,
      getClass: () => CtxClass,
    } as any;
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({ id: 'admin1', role: 'admin' });
  });

  it('truncate utility handles empty and long strings', () => {
    expect(truncate(undefined)).toBe('');
    expect(truncate('short')).toBe('short');
    expect(truncate('a'.repeat(30), 10)).toBe('a'.repeat(10) + '...');
  });
});