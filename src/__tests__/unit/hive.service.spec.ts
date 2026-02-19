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
  const mockFindById = jest.fn();
  const mockFindByIdAndUpdate = jest.fn();

  (mockModel as any).find = mockFind;
  (mockModel as any).countDocuments = mockCount;
  (mockModel as any).findById = mockFindById;
  (mockModel as any).findByIdAndUpdate = mockFindByIdAndUpdate;

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

  it('findOne throws when not found', async () => {
    mockFindById.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(service.findOne('nope', 'user1')).rejects.toThrow();
  });
});
