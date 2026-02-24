import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QueensService } from '../../queens/queens.service';
import { NotFoundException } from '@nestjs/common';

describe('QueensService (unit)', () => {
  let service: QueensService;
  const mockModel = jest.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this._id = 'id';
  });
  mockModel.prototype.toObject = function () {
    return { ...this };
  };
  (mockModel as any).find = jest.fn();
  (mockModel as any).findOne = jest.fn();
  (mockModel as any).findOneAndUpdate = jest.fn();
  (mockModel as any).deleteOne = jest.fn();


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueensService,
        { provide: getModelToken('Queen'), useValue: mockModel },
        // hiveModel is only used in migration; can be empty
        { provide: getModelToken('Hive'), useValue: {} },
      ],
    }).compile();

    service = module.get<QueensService>(QueensService);
  });

  it('create returns id', async () => {
    const res = await service.create({} as any, 'u');
    expect(res).toHaveProperty('id');
  });

  it('findAll returns mapped docs', async () => {
    (mockModel as any).find.mockReturnValue({ sort: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([{ _id: 'q1' }]) }) }) });
    const r = await service.findAll('u');
    expect(r).toEqual([{ _id: 'q1', id: 'q1' }]);
  });

  it('findByHive returns docs', async () => {
    (mockModel as any).find.mockReturnValue({ sort: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([{ _id: 'q2' }]) }) }) });
    const r = await service.findByHive('hive', 'u');
    expect(r).toEqual([{ _id: 'q2', id: 'q2' }]);
  });

  it('findOne throws if not found', async () => {
    (mockModel as any).findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findOne('x', 'u')).rejects.toThrow(NotFoundException);
  });

  it('update returns doc when found', async () => {
    (mockModel as any).findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'u2' }) });
    const r = await service.update('u2', {} as any, 'u');
    expect(r).toEqual({ _id: 'u2', id: 'u2' });
  });

  it('assignToHive throws if queen missing', async () => {
    (mockModel as any).findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.assignToHive('x', { hiveId: 'h' } as any, 'u')).rejects.toThrow(NotFoundException);
  });

  it('assignToHive handles existing queen displacement', async () => {
    const queen: any = { _id: 'q', hiveHistory: [{ hiveId: 'old', to: null }], status: '', save: jest.fn(), markModified: jest.fn() };
    queen.toObject = () => ({ ...queen });
    const other: any = { _id: 'o', hiveHistory: [{ hiveId: 'h', to: null }], status: 'active', save: jest.fn(), markModified: jest.fn() };
    other.toObject = () => ({ ...other });
    (mockModel as any).findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(queen) });
    (mockModel as any).find.mockReturnValue({ exec: jest.fn().mockResolvedValue([other]) });
    const res = await service.assignToHive('q', { hiveId: 'h' } as any, 'u');
    expect(res).toHaveProperty('id');
    expect(other.status).toBe('spare');
  });

  it('removeFromHive sets to and spare', async () => {
    const queen: any = { _id: 'q', hiveHistory: [{ hiveId: 'h', to: null }], status: 'active', save: jest.fn(), markModified: jest.fn() };
    queen.toObject = () => ({ ...queen });
    (mockModel as any).findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(queen) });
    const res = await service.removeFromHive('q', {} as any, 'u');
    expect(res.status).toBe('spare');
  });

  it('removeFromHive does nothing when already spare', async () => {
    const queen: any = { _id: 'q', hiveHistory: [{ hiveId: 'h', to: new Date() }], status: 'spare', save: jest.fn(), markModified: jest.fn() };
    queen.toObject = () => ({ ...queen });
    (mockModel as any).findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(queen) });
    const res = await service.removeFromHive('q', {} as any, 'u');
    expect(res).toHaveProperty('id');
  });
  it('findOne throws if not found', async () => {
    (mockModel as any).findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findOne('x', 'u')).rejects.toThrow(NotFoundException);
  });

  it('update throws if not found', async () => {
    (mockModel as any).findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update('x', {} as any, 'u')).rejects.toThrow(NotFoundException);
  });


  it('remove throws if not found', async () => {
    (mockModel as any).deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove('x', 'u')).rejects.toThrow(NotFoundException);
  });

  describe('onModuleInit migration', () => {
    beforeEach(() => {
      // reset spies
      (mockModel as any).findOne.mockReset();
      (mockModel as any).find.mockReset();
    });

    it('does nothing when no hives', async () => {
      const hiveMock = { find: jest.fn().mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([]) }) }) };
      (service as any).hiveModel = hiveMock;
      await service.onModuleInit();
      expect(hiveMock.find).toHaveBeenCalled();
    });

    it('migrates when hive has data and no existing queen', async () => {
      const hive = { _id: 'h1', userId: 'u', queenYear: 2020, installationDate: null };
      const hiveMock = {
        find: jest.fn().mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([hive]) }) }),
        updateOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      };
      const existing = null;
      (service as any).hiveModel = hiveMock;
      (mockModel as any).findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });
      const saveSpy = jest.fn().mockResolvedValue({});
      mockModel.mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = saveSpy;
        this._id = 'newq';
      });
      await service.onModuleInit();
      expect(saveSpy).toHaveBeenCalled();
      expect(hiveMock.updateOne).toHaveBeenCalledWith({ _id: hive._id }, { $set: { _queenMigrated: true } });
    });

    it('skips creating queen if existing found', async () => {
      const hive = { _id: 'h2', userId: 'u2' };
      const hiveMock = {
        find: jest.fn().mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue([hive]) }) }),
        updateOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      };
      (service as any).hiveModel = hiveMock;
      (mockModel as any).findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'existing' }) });
      const saveSpy = jest.fn();
      mockModel.mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        this.save = saveSpy;
        this._id = 'newq';
      });
      await service.onModuleInit();
      expect(saveSpy).not.toHaveBeenCalled();
      expect(hiveMock.updateOne).toHaveBeenCalled();
    });

    it('logs warning when hiveModel.find throws', async () => {
      const hiveMock = { find: jest.fn().mockImplementation(() => { throw new Error('boom'); }) };
      (service as any).hiveModel = hiveMock;
      const spy = jest.spyOn((service as any).logger, 'warn');
      await service.onModuleInit();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('Queen migration skipped'));
    });
  });
});