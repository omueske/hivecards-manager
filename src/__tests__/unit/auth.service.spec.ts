import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from '../../auth/auth.service';
import { MailService } from '../../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('AuthService (unit)', () => {
  let service: AuthService;

  // simple in-memory "model" with findOne hook that can be changed in tests
  const mockUserModel: any = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this._id = '507f1f77bcf86cd799439011';
    this.createdAt = new Date();
  };
  mockUserModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

  // helper to override findOne return
  const setFindOneResult = (result: any) => {
    mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(result) });
  };

  beforeEach(async () => {
    const mockMail = {
      sendVerificationEmail: jest.fn().mockResolvedValue(null),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a new user', async () => {
    const res = await service.register('u@example.com', 'secret', 'tester');
    expect(res).toHaveProperty('id');
    expect(res.email).toBe('u@example.com');
  });

  it('throws when email already exists', async () => {
    // make findOne return a truthy object
    setFindOneResult({ email: 'u@example.com' });
    await expect(service.register('u@example.com', 'pw', 'u')).rejects.toThrow('Email already registered');
  });

  it('defaults username placeholder when omitted', async () => {
    // ensure mail send doesn't blow up
    setFindOneResult(null);
    const spyDebug = jest.spyOn((service as any).logger, 'debug');
    await service.register('new@ex.com', 'pw');
    // wait a tick to allow any promise chaining to complete
    await new Promise(process.nextTick);
    expect(spyDebug).toHaveBeenCalledWith(expect.stringContaining('username=-'));
  });

  it('returns object with undefined username if not provided', async () => {
    setFindOneResult(null);
    const res = await service.register('xx@xx', 'pw');
    expect(res.username).toBeUndefined();
  });

  it('logs warning when email send fails on register', async () => {
    setFindOneResult(null);
    // override mailService to reject
    (service as any).mailService.sendVerificationEmail = jest.fn().mockRejectedValue(new Error('fail'));
    const spyWarn = jest.spyOn((service as any).logger, 'warn');
    await service.register('b@b', 'pw', 'u');
    // give microtask time for catch
    await new Promise(process.nextTick);
    expect(spyWarn).toHaveBeenCalledWith(expect.stringContaining('Failed to send verification email'));
  });

  describe('forgotPassword failures', () => {
    it('logs when mail send fails', async () => {
      const user: any = { save: jest.fn() };
      setFindOneResult(user);
      (service as any).mailService.sendPasswordResetEmail = jest.fn().mockRejectedValue(new Error('boom'));
      const spyWarn = jest.spyOn((service as any).logger, 'warn');
      await service.forgotPassword('x');
      await new Promise(process.nextTick);
      expect(spyWarn).toHaveBeenCalledWith(expect.stringContaining('Failed to send reset email'));
    });
  });

  describe('forgotPassword failures', () => {
    it('logs when mail send fails', async () => {
      const user: any = { save: jest.fn() };
      setFindOneResult(user);
      (service as any).mailService.sendPasswordResetEmail = jest.fn().mockRejectedValue(new Error('boom'));
      const spyWarn = jest.spyOn((service as any).logger, 'warn');
      await service.forgotPassword('x');
      expect(spyWarn).toHaveBeenCalledWith(expect.stringContaining('Failed to send reset email'));
    });
  });

  describe('email verification', () => {
    it('throws if token not found', async () => {
      setFindOneResult(null);
      await expect(service.verifyEmail('notoken')).rejects.toThrow();
    });

    it('throws on expired token', async () => {
      const user: any = { emailVerificationExpires: new Date(Date.now() - 1000) };
      setFindOneResult(user);
      await expect(service.verifyEmail('tok')).rejects.toThrow();
    });

    it('marks user verified', async () => {
      const user: any = {
        _id: { toString: () => 'uid' },
        email: 'x@x',
        emailVerificationExpires: new Date(Date.now() + 10000),
        save: jest.fn(),
      };
      setFindOneResult(user);
      const res = await service.verifyEmail('tok');
      expect(res).toEqual({ ok: true });
      expect(user.emailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeUndefined();
    });
  });

  describe('password flows', () => {
    it('forgotPassword returns ok for missing user', async () => {
      setFindOneResult(null);
      const r = await service.forgotPassword('noone');
      expect(r).toEqual({ ok: true });
    });

    it('forgotPassword sets tokens for existing user', async () => {
      const user: any = { save: jest.fn() };
      setFindOneResult(user);
      const r = await service.forgotPassword('exists');
      expect(r).toEqual({ ok: true });
      expect(user.passwordResetToken).toBeDefined();
    });

    it('resetPassword throws if token invalid', async () => {
      setFindOneResult(null);
      await expect(service.resetPassword('bad', 'new')).rejects.toThrow();
    });

    it('resetPassword throws if expired', async () => {
      const user: any = { passwordResetExpires: new Date(Date.now() - 1000) };
      setFindOneResult(user);
      await expect(service.resetPassword('t', 'new')).rejects.toThrow();
    });

    it('resetPassword works', async () => {
      const user: any = {
        _id: { toString: () => 'uid' },
        passwordResetExpires: new Date(Date.now() + 1000),
        save: jest.fn(),
      };
      setFindOneResult(user);
      const res = await service.resetPassword('t', 'new');
      expect(res).toEqual({ ok: true });
      expect(user.passwordHash).toBeDefined();
    });
  });

  describe('validateUser & tokens', () => {
    it('returns null when user not found', async () => {
      setFindOneResult(null);
      expect(await service.validateUser('x', 'y')).toBeNull();
    });

    it('rejects wrong password', async () => {
      const user: any = { passwordHash: await bcrypt.hash('pwd', 1) };
      setFindOneResult(user);
      expect(await service.validateUser('u', 'wrong')).toBeNull();
    });

    it('throws when email not verified', async () => {
      const user: any = { _id: { toString: () => 'id' }, passwordHash: await bcrypt.hash('pwd', 1), emailVerified: false };
      setFindOneResult(user);
      await expect(service.validateUser('u', 'pwd')).rejects.toThrow();
    });

    it('returns user on valid credentials', async () => {
      const user: any = { passwordHash: await bcrypt.hash('pwd', 1), emailVerified: true, _id: 'id' };
      setFindOneResult(user);
      const u = await service.validateUser('u', 'pwd');
      expect(u).toBe(user);
    });

    it('signs and verifies tokens', () => {
      // ensure no JWT_SECRET is set so we hit the default branch
      delete process.env.JWT_SECRET;
      const tokens = service.signTokens('abc');
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      const payload = service.verifyToken(tokens.accessToken);
      expect(payload?.sub).toBe('abc');
      expect(service.verifyToken('broken')).toBeNull();
    });

    it('uses JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'envsecret';
      const tokens = service.signTokens('xyz');
      const payload = service.verifyToken(tokens.accessToken);
      expect(payload?.sub).toBe('xyz');
      delete process.env.JWT_SECRET;
    });

    it('verifyToken catches weird error object', () => {
      // simulate jwt throwing an object without name/message
      const orig = (jwt as any).verify;
      (jwt as any).verify = jest.fn().mockImplementation(() => {
        throw {};
      });
      expect(service.verifyToken('foo')).toBeNull();
      (jwt as any).verify = orig;
    });
  });
});
