import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TreatmentAgentsService } from '../../treatment-agents/treatment-agents.service';
import { ConflictException } from '@nestjs/common';

describe('TreatmentAgentsService (unit)', () => {
  let service: TreatmentAgentsService;
  const mockModel = {
    find: jest.fn(),
    create: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentAgentsService,
        { provide: getModelToken('TreatmentAgent'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<TreatmentAgentsService>(TreatmentAgentsService);
  });

  it('findAllForUser returns mapped array with category filter', async () => {
    mockModel.find.mockReturnValue({ sort: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([{ _id: '1', name: 'x' }]) }) }) });
    const res = await service.findAllForUser('u', 'treatment');
    expect(res).toEqual([{ id: '1', name: 'x' }]);
  });

  it('findAllForUser defaults category', async () => {
    mockModel.find.mockReturnValue({ sort: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue([]) }) }) });
    await service.findAllForUser('u');
  });

  it('create throws conflict on duplicate', async () => {
    mockModel.create.mockRejectedValue({ code: 11000 });
    await expect(service.create({ name: 'a' } as any, 'u')).rejects.toBeInstanceOf(ConflictException);
  });

  it('create returns id and trimmed name', async () => {
    const logSpy = jest.spyOn((service as any).logger, 'log');
    mockModel.create.mockResolvedValue({ _id: 't1', name: 'foo' });
    const r = await service.create({ name: ' foo ' } as any, 'u');
    expect(r).toEqual({ id: 't1', name: 'foo' });
    expect(logSpy).toHaveBeenCalled();
  });
});