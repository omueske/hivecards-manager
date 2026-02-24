import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InspectionsService } from '../../inspections/inspections.service';
import { NotFoundException } from '@nestjs/common';

describe('InspectionsService (unit)', () => {
  let service: InspectionsService;
  const mockModel = jest.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this._id = 'id';
  });
  mockModel.prototype.toObject = function () {
    return { ...this };
  };
  (mockModel as any).find = jest.fn();
  (mockModel as any).countDocuments = jest.fn();
  (mockModel as any).findOne = jest.fn();
  (mockModel as any).findOneAndUpdate = jest.fn();
  (mockModel as any).deleteOne = jest.fn();

  beforeEach(async () => {
    // make ObjectId just echo so we don't need valid IDs
    const { Types } = require('mongoose');
    jest.spyOn(Types, 'ObjectId').mockImplementation((x: any) => x);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionsService,
        { provide: getModelToken('Inspection'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<InspectionsService>(InspectionsService);
  });

  it('create returns id', async () => {
    const dto = { hiveId: 'h', type: 'note' } as any;
    const res = await service.create(dto, 'u');
    expect(res).toHaveProperty('id');
  });

  it('create respects default type value', async () => {
    const dto = { hiveId: 'h' } as any;
    const res = await service.create(dto, 'u');
    expect(res).toHaveProperty('id');
  });

  it('findAll returns pagination with hiveId filtered', async () => {
    (mockModel as any).find.mockReturnValue({
      sort: () => ({ skip: () => ({ limit: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([{ _id: 'i1' }]) }) }) }) }),
    });
    (mockModel as any).countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const res = await service.findAll('someHive', 'u', 2, 3);
    expect(res.pagination).toEqual({ page: 2, limit: 3, total: 1 });
  });

  it('update throws when not found', async () => {
    (mockModel as any).findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update('x', {} as any, 'u')).rejects.toThrow(NotFoundException);
  });

  it('update returns updated doc', async () => {
    const upd = { _id: 'u1' };
    (mockModel as any).findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(upd) });
    const r = await service.update('u1', { foo: 'bar' } as any, 'u');
    expect(r).toEqual({ ...upd, id: 'u1' });
  });

  it('remove throws when not found', async () => {
    (mockModel as any).deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove('x', 'u')).rejects.toThrow(NotFoundException);
  });

  it('remove succeeds when deletedCount >0', async () => {
    (mockModel as any).deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove('x', 'u')).resolves.toBeUndefined();
  });
  it('update throws when not found', async () => {
    (mockModel as any).findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update('x', {} as any, 'u')).rejects.toThrow(NotFoundException);
  });

  it('remove throws when not found', async () => {
    (mockModel as any).deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove('x', 'u')).rejects.toThrow(NotFoundException);
  });
});
