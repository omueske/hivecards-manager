import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ApiariesService } from '../../apiaries/apiaries.service';
import { NotFoundException } from '@nestjs/common';

describe('ApiariesService (unit)', () => {
  let service: ApiariesService;
  const mockModel = jest.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this._id = 'id';
  });
  // provide toObject for service
  mockModel.prototype.toObject = function () {
    return { ...this };
  };
  (mockModel as any).find = jest.fn();
  (mockModel as any).findOne = jest.fn();
  (mockModel as any).findOneAndUpdate = jest.fn();
  (mockModel as any).findOneAndDelete = jest.fn();

  const hiveModel = { updateMany: jest.fn().mockReturnValue({ exec: jest.fn() }) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiariesService,
        { provide: getModelToken('Apiary'), useValue: mockModel },
        { provide: getModelToken('Hive'), useValue: hiveModel },
      ],
    }).compile();

    service = module.get<ApiariesService>(ApiariesService);
  });

  it('create returns object with id', async () => {
    const dto = { name: 'n' } as any;
    const res = await service.create(dto, 'u');
    expect(res).toHaveProperty('id');
  });

  it('findAll returns mapped docs', async () => {
    const docs = [{ _id: '1', name: 'a' }];
    (mockModel as any).find.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(docs) }) });
    const res = await service.findAll('u');
    expect(res).toEqual([{ _id: '1', name: 'a', id: '1' }]);
  });

  it('findOne throws if not found', async () => {
    (mockModel as any).findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findOne('x', 'u')).rejects.toThrow(NotFoundException);
  });

  it('findOne returns doc when present', async () => {
    const doc = { _id: 'id1', name: 'foo' };
    (mockModel as any).findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(doc) }) });
    const r = await service.findOne('id1', 'u');
    expect(r).toEqual({ ...doc, id: 'id1' });
  });

  it('update throws if not found', async () => {
    (mockModel as any).findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.update('x', {} as any, 'u')).rejects.toThrow(NotFoundException);
  });

  it('update returns object when found', async () => {
    const doc = { _id: 'id2', name: 'bar' };
    (mockModel as any).findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(doc) }) });
    const r = await service.update('id2', { name: 'bar' } as any, 'u');
    expect(r).toEqual({ ...doc, id: 'id2' });
  });

  it('remove throws if not found', async () => {
    hiveModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
    (mockModel as any).findOneAndDelete.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.remove('x', 'u')).rejects.toThrow(NotFoundException);
  });

  it('remove unlinks hives and returns ok when found', async () => {
    hiveModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
    (mockModel as any).findOneAndDelete.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: 'id3' }) }) });
    const r = await service.remove('id3', 'u');
    expect(r).toEqual({ ok: true });
  });
});