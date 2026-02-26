import { UsersController } from '../../auth/users.controller';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

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
      expect(r).toEqual({ id: userId, role: 'user' });
    });

    it('returns user data when found', async () => {
      const u = { _id: userId, email: 'a@b', username: 'u', emailVerified: true, role: 'admin' };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(u) }) });
      const r = await controller.me(req);
      expect(r).toEqual({
        id: userId,
        email: 'a@b',
        username: 'u',
        emailVerified: true,
        role: 'admin',
      });
    });
  });

  describe('updateMe', () => {
    it('updates username and email', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = { _id: userId, email: 'new@e', username: 'new', emailVerified: true, role: 'user' };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });
      const r = await controller.updateMe(req, { username: 'new', email: 'new@e' });
      expect(r).toEqual({
        id: userId,
        email: 'new@e',
        username: 'new',
        emailVerified: true,
        role: 'user',
      });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, { username: 'new', email: 'new@e' });
    });

    it('hashes password when provided', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = { _id: userId, email: 'e@e', username: 'u', emailVerified: true, role: 'user' };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });
      const spyHash = jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('hashed' as any);
      await controller.updateMe(req, { password: 'plain' });
      expect(spyHash).toHaveBeenCalled();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, { passwordHash: 'hashed' });
    });

    it('throws if user not found after update', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
      await expect(controller.updateMe(req, { username: 'x' } as any)).rejects.toThrow();
    });

    it('updates role for target user', async () => {
      const updated = { _id: 'target1', email: 'x@x', username: 'x', role: 'admin' };
      userModel.findByIdAndUpdate.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }),
      });
      const result = await controller.updateRole(req, 'target1', { role: 'admin' });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'target1',
        { role: 'admin' },
        { new: true },
      );
      expect(result).toEqual({ id: 'target1', email: 'x@x', username: 'x', role: 'admin' });
    });

    it('rejects invalid role values', async () => {
      await expect(controller.updateRole(req, 'target1', { role: 'owner' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when role target not found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
      });
      await expect(controller.updateRole(req, 'missing', { role: 'admin' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});