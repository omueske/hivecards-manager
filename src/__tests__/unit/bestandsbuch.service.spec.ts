import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BestandsbuchService } from '../../bestandsbuch/bestandsbuch.service';

describe('BestandsbuchService (unit)', () => {
  let service: BestandsbuchService;
  let model: any;
  let hiveModel: any;
  let apiaryModel: any;
  let userModel: any;
  let inspectionModel: any;

  beforeEach(async () => {
    model = {
      find: jest.fn(),
      distinct: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) }),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ acknowledged: true }) }),
    };

    hiveModel = {
      findOne: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: 'h1', hiveNumber: 'V-01', apiaryId: 'a1' }) }),
      }),
    };

    apiaryModel = {
      findOne: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: 'a1', name: 'Heimstand' }) }),
      }),
    };

    userModel = {
      findById: jest.fn().mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: 'u1', username: 'Oliver Imker' }) }),
      }),
    };

    inspectionModel = {
      findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      findOne: jest.fn().mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) }),
      create: jest.fn().mockResolvedValue({ _id: 'i1' }),
      deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) }),
    };

    model.findOne.mockReturnValue({ sort: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) }) });
    model.create.mockImplementation(async (payload: any) => ({ _id: 'b1', toObject: () => payload }));

    const module = await Test.createTestingModule({
      providers: [
        BestandsbuchService,
        { provide: getModelToken('BestandsbuchEntry'), useValue: model },
        { provide: getModelToken('Hive'), useValue: hiveModel },
        { provide: getModelToken('Apiary'), useValue: apiaryModel },
        { provide: getModelToken('User'), useValue: userModel },
        { provide: getModelToken('Inspection'), useValue: inspectionModel },
      ],
    }).compile();

    service = module.get(BestandsbuchService);
  });

  it('fills hive/apiary/user fields on create', async () => {
    const result = await service.create(
      {
        hiveId: 'h1',
        applicationDate: '2026-03-03',
        medicineName: 'Oxalsäure',
      },
      'u1',
      { skipInspectionSync: true },
    );

    expect(result.hiveLabel).toBe('V-01');
    expect(result.apiaryName).toBe('Heimstand');
    expect(result.beekeeperName).toBe('Oliver Imker');
    expect(result.treatedBy).toBe('Oliver Imker');
  });

  it('creates entry when syncing from treatment inspection', async () => {
    model.findOne.mockReturnValueOnce({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });

    await service.syncFromInspection(
      {
        id: 'i55',
        type: 'treatment',
        hiveId: 'h1',
        date: '2026-03-01',
        treatmentAgent: 'Ameisensäure 60%',
        treatmentAmount: '150 ml',
      },
      'u1',
    );

    expect(model.create).toHaveBeenCalled();
  });

  it('creates treatment inspection when bestandsbuch entry has none', async () => {
    model.create.mockImplementationOnce(async (payload: any) => ({ _id: 'b9', toObject: () => payload }));

    await service.create(
      {
        hiveId: 'h1',
        applicationDate: '2026-03-02',
        medicineName: 'Oxuvar',
        amount: '30 ml',
      },
      'u1',
    );

    expect(inspectionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'treatment',
        treatmentAgent: 'Oxuvar',
        treatmentAmount: '30 ml',
      }),
    );
  });
});
