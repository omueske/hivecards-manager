import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HiveService } from '../../hives/hives.service';

describe('HiveService (unit)', () => {
  let service: HiveService;

  const mockModel = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this._id = '507f1f77bcf86cd799439012';
  } as any;

  mockModel.prototype.toObject = function () {
    return { ...this };
  };

  const mockFind = jest.fn();
  const mockCount = jest.fn();
  const mockFindOne = jest.fn();
  const mockFindOneAndUpdate = jest.fn();

  (mockModel as any).find = mockFind;
  (mockModel as any).countDocuments = mockCount;
  (mockModel as any).findOne = mockFindOne;
  (mockModel as any).findOneAndUpdate = mockFindOneAndUpdate;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HiveService, { provide: getModelToken('Hive'), useValue: mockModel }],
    }).compile();

    service = module.get<HiveService>(HiveService);
  });

  it('creates a hive', async () => {
    const dto = { apiaryId: 'a1', hiveNumber: 'H-100', status: 'active' };
    const res = await service.create(dto as any, 'user1');
    expect(res).toHaveProperty('id');
  });

  it('findAll returns items and pagination', async () => {
    mockFind.mockReturnValue({ skip: () => ({ limit: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([ { hiveNumber: 'x' } ]) }) }) }) });
    mockCount.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const res = await service.findAll({}, 'user1', 1, 10);
    expect(res).toHaveProperty('items');
    expect(res.pagination.total).toBe(1);
  });

  it('findAll uses defaults when called with only userId', async () => {
    mockFind.mockReturnValue({ skip: () => ({ limit: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([]) }) }) }) });
    mockCount.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });
    const res = await service.findAll(undefined as any, 'user1');
    expect(res).toEqual({ pagination: { page: 1, limit: 25, total: 0 }, items: [] });
  });

  it('findOne throws when not found', async () => {
    mockFindOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findOne('nope', 'user1')).rejects.toThrow();
  });

  it('findOne returns doc when found', async () => {
    const doc = { _id: 'id1', hiveNumber: 'x' };
    mockFindOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(doc) }) });
    const res = await service.findOne('id1', 'user1');
    expect(res).toEqual({ ...doc, id: 'id1' });
  });

  it('update throws when not found', async () => {
    mockFindOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.update('id', { hiveNumber: 'h' } as any, 'u')).rejects.toThrow();
  });

  it('update removes apiaryId when empty string', async () => {
    const updated = { _id: 'id', hiveNumber: 'h' };
    mockFindOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(updated) }) });
    const res = await service.update('id', { apiaryId: '' } as any, 'u');
    expect(res).toEqual({ ...updated, id: 'id' });
  });

  it('remove throws when not found', async () => {
    mockFindOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.remove('id', 'u')).rejects.toThrow();
  });

  it('remove succeeds', async () => {
    mockFindOneAndUpdate.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue({}) }) });
    await expect(service.remove('id', 'u')).resolves.toBeUndefined();
  });
});
