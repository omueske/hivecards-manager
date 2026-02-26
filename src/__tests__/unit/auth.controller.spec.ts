import { AuthController } from '../../auth/auth.controller';
import { BadRequestException } from '@nestjs/common';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  let authService: any;
  let res: any;

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      signTokens: jest.fn(),
      verifyToken: jest.fn(),
      verifyEmail: jest.fn().mockResolvedValue(null),
    };
    controller = new AuthController(authService);
    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      redirect: jest.fn(),
    } as any;
  });

  describe('register', () => {
    it('calls authService.register and returns the result', async () => {
      authService.register.mockResolvedValue({ id: 'u1', email: 'a@b', role: 'user' });
      const dto = { email: 'a@b', password: 'pw' } as any;
      const res = await controller.register(dto);
      expect(res).toEqual(expect.objectContaining({ id: 'u1', email: 'a@b' }));
      expect(authService.register).toHaveBeenCalledWith('a@b', 'pw', undefined);
    });

    it('throws when email or password missing', async () => {
      await expect(controller.register({ email: '', password: '' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('login', () => {
    it('sets cookie and returns access token on success', async () => {
      authService.validateUser.mockResolvedValue({ _id: 'uid' });
      authService.signTokens.mockReturnValue({ accessToken: 'at', refreshToken: 'rt' });
      const dto = { email: 'e', password: 'p' } as any;
      const result = await controller.login(dto, res);
      expect(authService.validateUser).toHaveBeenCalledWith('e', 'p');
      expect(res.cookie).toHaveBeenCalledWith('hc_refresh', 'rt', expect.any(Object));
      expect(result).toEqual({ accessToken: 'at' });
    });

    it('throws when credentials invalid', async () => {
      authService.validateUser.mockResolvedValue(null);
      await expect(controller.login({ email: 'e', password: 'p' } as any, res)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('other endpoints', () => {
    it('verifyEmail throws when token missing', async () => {
      await expect(controller.verifyEmail('', res)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('verifyEmail redirects when token present', async () => {
      authService.verifyToken = jest.fn();
      await controller.verifyEmail('tok', res);
      expect(res.redirect).toHaveBeenCalled();
    });

    it('forgotPassword requires email', async () => {
      await expect(controller.forgotPassword({} as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('forgotPassword succeeds', async () => {
      authService.forgotPassword = jest.fn().mockResolvedValue({ ok: true });
      const result = await controller.forgotPassword({ email: 'a@b' } as any);
      expect(result).toEqual({ ok: true });
    });

    it('resetPassword requires token and password', async () => {
      await expect(controller.resetPassword({} as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('resetPassword rejects too-short password', async () => {
      const dto = { token: 't', password: 'short' } as any;
      await expect(controller.resetPassword(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('resetPassword succeeds', async () => {
      authService.resetPassword = jest.fn().mockResolvedValue({ ok: true });
      const dto = { token: 't', password: 'password123' } as any;
      const result = await controller.resetPassword(dto);
      expect(result).toEqual({ ok: true });
    });

    it('refresh clears cookie if missing', async () => {
      const req: any = { cookies: {} };
      const result1 = await controller.refresh(req, res);
      expect(result1).toEqual(undefined);
    });

    it('refresh clears invalid token and returns 204', async () => {
      const req: any = { cookies: { hc_refresh: 'bad' } };
      authService.verifyToken = jest.fn().mockReturnValue(null);
      await controller.refresh(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith('hc_refresh');
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('refresh issues new tokens when valid', async () => {
      const req: any = { cookies: { hc_refresh: 'good' } };
      authService.verifyToken = jest.fn().mockReturnValue({ sub: 'uid' });
      authService.signTokens = jest.fn().mockReturnValue({ accessToken: 'at', refreshToken: 'rt' });
      const result3 = await controller.refresh(req, res);
      expect(res.cookie).toHaveBeenCalledWith('hc_refresh', 'rt', expect.any(Object));
      expect(result3).toEqual({ accessToken: 'at' });
    });

    it('logout clears cookie', async () => {
      const out = await controller.logout(res);
      expect(res.clearCookie).toHaveBeenCalledWith('hc_refresh');
      expect(out).toEqual({ ok: true });
    });
  });
});