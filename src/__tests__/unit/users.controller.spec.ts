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
      const u = {
        _id: userId,
        email: 'a@b',
        username: 'u',
        streetHouseNumber: 'Musterweg 1',
        postalCode: '12345',
        city: 'Musterstadt',
        phone: '0123456789',
        operationNumber: 'DE-123-456',
        emailVerified: true,
        role: 'admin',
        breederCountry: 'DE',
        breederAssociation: 12,
        breederNumber: 345,
        defaultApiaryNumber: 7,
        defaultMatingType: 2,
        isObmann: true,
        obmannNumber: 88,
        dateInputMode: 'full',
      };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(u) }) });
      const r = await controller.me(req);
      expect(r).toEqual({
        id: userId,
        email: 'a@b',
        username: 'u',
        streetHouseNumber: 'Musterweg 1',
        postalCode: '12345',
        city: 'Musterstadt',
        phone: '0123456789',
        operationNumber: 'DE-123-456',
        emailVerified: true,
        role: 'admin',
        breederCountry: 'DE',
        breederAssociation: 12,
        breederAssociationCode: 'DE-12',
        breederNumber: 345,
        defaultApiaryNumber: 7,
        defaultMatingType: 2,
        isObmann: true,
        obmannNumber: 88,
        dateInputMode: 'full',
      });
    });
  });

  describe('updateMe', () => {
    it('updates username and email', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = {
        _id: userId,
        email: 'new@e',
        username: 'new',
        emailVerified: true,
        role: 'user',
        isObmann: false,
      };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });
      const r = await controller.updateMe(req, { username: 'new', email: 'new@e' });
      expect(r).toEqual({
        id: userId,
        email: 'new@e',
        username: 'new',
        streetHouseNumber: undefined,
        postalCode: undefined,
        city: undefined,
        phone: undefined,
        operationNumber: undefined,
        emailVerified: true,
        role: 'user',
        breederCountry: undefined,
        breederAssociation: undefined,
        breederAssociationCode: undefined,
        breederNumber: undefined,
        defaultApiaryNumber: undefined,
        defaultMatingType: undefined,
        isObmann: false,
        obmannNumber: undefined,
        dateInputMode: undefined,
      });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, { username: 'new', email: 'new@e' });
    });

    it('updates breeder profile defaults', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = {
        _id: userId,
        email: 'e@e',
        username: 'u',
        emailVerified: true,
        role: 'user',
        breederCountry: 'DE',
        breederAssociation: 1,
        breederNumber: 2,
        defaultApiaryNumber: 3,
        defaultMatingType: 1,
        isObmann: true,
        obmannNumber: 4,
        dateInputMode: 'week',
      };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });

      await controller.updateMe(req, {
        breederCountry: 'de',
        breederAssociation: 1,
        breederNumber: 2,
        defaultApiaryNumber: 3,
        defaultMatingType: 1,
        isObmann: true,
        obmannNumber: 4,
        dateInputMode: 'week',
      });

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          breederCountry: 'DE',
          breederAssociation: 1,
          breederNumber: 2,
          defaultApiaryNumber: 3,
          defaultMatingType: 1,
          isObmann: true,
          obmannNumber: 4,
          dateInputMode: 'week',
        }),
      );
    });

    it('updates breeder country and association by breederAssociationCode', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const updated = {
        _id: userId,
        email: 'e@e',
        username: 'u',
        emailVerified: true,
        role: 'user',
        breederCountry: 'DE',
        breederAssociation: 12,
      };
      userModel.findById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });

      await controller.updateMe(req, {
        breederAssociationCode: 'de-12',
      });

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          breederCountry: 'DE',
          breederAssociation: 12,
        }),
      );
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

    it('rejects invalid breeder profile values', async () => {
      await expect(controller.updateMe(req, { breederAssociation: 0 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(controller.updateMe(req, { breederAssociationCode: 'ZZ-1' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(controller.updateMe(req, { obmannNumber: 1, isObmann: false })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns breeder association options', async () => {
      const result = await controller.breederAssociations();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(
        expect.objectContaining({
          code: expect.any(String),
          country: expect.any(String),
          associationNumber: expect.any(Number),
          name: expect.any(String),
        }),
      );
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