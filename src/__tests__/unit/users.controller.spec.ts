import { UsersController } from '../../auth/users.controller';
import * as bcrypt from 'bcrypt';

describe('UsersController (unit)', () => {
  let controller: UsersController;
  let userModel: any;
  const userId = 'userid';
  const req: any = { user: { id: userId } };

  beforeEach(() => {
    userModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    controller = new UsersController(userModel as any);
  });

  describe('me', () => {
    it('returns minimal object when user missing', async () => {
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
      const r = await controller.me(req);
      expect(r).toEqual({ id: userId });
    });

    it('returns user data when found', async () => {
      const u = { _id: userId, email: 'a@b', username: 'u' };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(u) }) });
      const r = await controller.me(req);
      expect(r).toEqual({ id: userId, email: 'a@b', username: 'u' });
    });
  });

  describe('updateMe', () => {
    it('updates username and email', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = { _id: userId, email: 'new@e', username: 'new' };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });
      const r = await controller.updateMe(req, { username: 'new', email: 'new@e' });
      expect(r).toEqual({ id: userId, email: 'new@e', username: 'new' });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, { username: 'new', email: 'new@e' });
    });

    it('hashes password when provided', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = { _id: userId, email: 'e@e', username: 'u' };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });
      const spyHash = jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('hashed' as any);
      const r = await controller.updateMe(req, { password: 'plain' });
      expect(spyHash).toHaveBeenCalled();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, { passwordHash: 'hashed' });
    });

    it('throws if user not found after update', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
      await expect(controller.updateMe(req, { username: 'x' } as any)).rejects.toThrow();
    });
  });
});