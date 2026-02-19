import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from '../../auth/auth.service';

describe('AuthService (unit)', () => {
  let service: AuthService;

  const mockUserModel = function (this: any, data: any) {
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.username = data.username;
    this.save = jest.fn().mockResolvedValue(this);
    this._id = '507f1f77bcf86cd799439011';
    this.createdAt = new Date();
  } as any;

  (mockUserModel as any).findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: getModelToken('User'), useValue: mockUserModel }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a new user', async () => {
    const res = await service.register('u@example.com', 'secret', 'tester');
    expect(res).toHaveProperty('id');
    expect(res.email).toBe('u@example.com');
  });
});
