import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from '../../auth/auth.service';
import { MailService } from '../../mail/mail.service';
import * as bcrypt from 'bcrypt';

describe('AuthService - Case Insensitive Email', () => {
  let service: AuthService;
  let savedUsers: any[] = [];

  const mockUserModel: any = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockImplementation(() => {
      this._id = 'test-user-id-' + Date.now();
      this.createdAt = new Date();
      savedUsers.push({ ...this, email: this.email?.toLowerCase() });
      return Promise.resolve(this);
    });
  };

  mockUserModel.findOne = jest.fn().mockImplementation(({ email }: any) => {
    return {
      exec: jest.fn().mockResolvedValue(
        savedUsers.find((u) => u.email === email?.toLowerCase()) || null,
      ),
    };
  });

  const mockMail = {
    sendVerificationEmail: jest.fn().mockResolvedValue(null),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    savedUsers = [];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('converts email to lowercase on registration', async () => {
      const result = await service.register('Test@Example.COM', 'password123', 'TestUser');
      
      expect(result.email).toBe('test@example.com');
      expect(savedUsers[0].email).toBe('test@example.com');
    });

    it('prevents duplicate registration with different case', async () => {
      await service.register('user@example.com', 'password123');
      
      // Try to register with different case
      await expect(service.register('User@Example.COM', 'password456')).rejects.toThrow(
        'Email already registered',
      );
    });

    it('trims whitespace from email', async () => {
      const result = await service.register('  test@example.com  ', 'password123');
      
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('validateUser (login)', () => {
    beforeEach(async () => {
      // Create a test user with lowercase email
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      savedUsers.push({
        _id: 'user123',
        email: 'testuser@example.com',
        passwordHash: hashedPassword,
        emailVerified: true,
      });
    });

    it('allows login with uppercase email', async () => {
      const user = await service.validateUser('TESTUSER@EXAMPLE.COM', 'correctpassword');
      
      expect(user).not.toBeNull();
      expect(user?.email).toBe('testuser@example.com');
    });

    it('allows login with mixed case email', async () => {
      const user = await service.validateUser('TestUser@Example.Com', 'correctpassword');
      
      expect(user).not.toBeNull();
      expect(user?.email).toBe('testuser@example.com');
    });

    it('allows login with email having extra whitespace', async () => {
      const user = await service.validateUser('  testuser@example.com  ', 'correctpassword');
      
      expect(user).not.toBeNull();
      expect(user?.email).toBe('testuser@example.com');
    });

    it('returns null for wrong password regardless of case', async () => {
      const user = await service.validateUser('TESTUSER@EXAMPLE.COM', 'wrongpassword');
      
      expect(user).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => {
      savedUsers.push({
        _id: 'user123',
        email: 'reset@example.com',
        save: jest.fn().mockResolvedValue(true),
      });
    });

    it('finds user with different case email', async () => {
      const result = await service.forgotPassword('Reset@Example.COM');
      
      expect(result).toEqual({ ok: true });
      expect(mockMail.sendPasswordResetEmail).toHaveBeenCalledWith(
        'reset@example.com',
        expect.any(String),
        undefined,
      );
    });

    it('handles email with whitespace', async () => {
      const result = await service.forgotPassword('  reset@example.com  ');
      
      expect(result).toEqual({ ok: true });
    });
  });
});
