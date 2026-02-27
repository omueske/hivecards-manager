import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BreedingBookService } from '../../breeding-book/breeding-book.service';

describe('BreedingBookService (unit)', () => {
  let service: BreedingBookService;
  let model: any;
  let queenModel: any;

  beforeEach(async () => {
    model = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      exists: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    queenModel = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      create: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ acknowledged: true }) }),
    };

    const module = await Test.createTestingModule({
      providers: [
        BreedingBookService,
        { provide: getModelToken('BreedingBookEntry'), useValue: model },
        { provide: getModelToken('Queen'), useValue: queenModel },
      ],
    }).compile();

    service = module.get(BreedingBookService);
  });

  it('creates entry and auto-creates queen from code1a when missing', async () => {
    queenModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    queenModel.create.mockResolvedValue({ _id: 'q1', name: 'DE-1-2-3-2024' });
    model.create.mockResolvedValue({ _id: 'b1', toObject: () => ({ some: 'value' }) });

    const result = await service.create(
      { code1a: 'de-1-2-3-2024', notes: 'n' } as any,
      'u1',
    );

    expect(queenModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', name: 'DE-1-2-3-2024' }),
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', queenId: 'q1', code1a: 'DE-1-2-3-2024' }),
    );
    expect(result.id).toBe('b1');
  });

  it('builds 1A code from parts and links existing queen', async () => {
    queenModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'q2', name: 'DE-1-2-3-2024' }) });
    model.create.mockResolvedValue({ _id: 'b2', toObject: () => ({ ok: true }) });

    await service.create(
      { l1a: 'de', lv1a: 1, z1a: 2, nr1a: 3, j1a: 2024 } as any,
      'u1',
    );

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ code1a: 'DE-1-2-3-2024', queenId: 'q2' }),
    );
  });

  it('maps ANPAARTYP to queen mating type and computes queen color from year', async () => {
    queenModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    queenModel.create.mockResolvedValue({ _id: 'q4', name: 'DE-1-2-3-2024' });
    model.create.mockResolvedValue({ _id: 'b4', toObject: () => ({ ok: true }) });

    await service.create(
      { l1a: 'de', lv1a: 1, z1a: 2, nr1a: 3, j1a: 2024, anpaarTyp: 2 } as any,
      'u1',
    );

    expect(queenModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'DE-1-2-3-2024',
        queenYear: 2024,
        queenColor: 'Grün',
        matingType: 'Belegstelle',
      }),
    );
  });

  it('syncs missing queen origin and notes for existing queen link', async () => {
    queenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'q5', name: 'DE-1-2-3-2024' }),
    });
    model.create.mockResolvedValue({ _id: 'b5', toObject: () => ({ ok: true }) });

    await service.create(
      {
        l1a: 'de',
        lv1a: 1,
        z1a: 2,
        nr1a: 3,
        j1a: 2024,
        notes: 'aus Zuchtbuch',
      } as any,
      'u1',
    );

    expect(queenModel.updateOne).toHaveBeenCalledWith(
      { _id: 'q5', userId: 'u1' },
      {
        $set: expect.objectContaining({
          queenOrigin: 'DE',
          notes: 'aus Zuchtbuch',
        }),
      },
    );
  });

  it('updates existing queen mating type from breeding book value', async () => {
    queenModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'q6',
        name: 'DE-1-2-3-2024',
        matingType: 'Standbegattet',
      }),
    });
    model.create.mockResolvedValue({ _id: 'b6', toObject: () => ({ ok: true }) });

    await service.create(
      { l1a: 'de', lv1a: 1, z1a: 2, nr1a: 3, j1a: 2024, anpaarTyp: 1 } as any,
      'u1',
    );

    expect(queenModel.updateOne).toHaveBeenCalledWith(
      { _id: 'q6', userId: 'u1' },
      {
        $set: expect.objectContaining({
          matingType: 'instrumentell',
        }),
      },
    );
  });

  it('maps ANPAARTYP 4 to Inselbegattung', async () => {
    queenModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    queenModel.create.mockResolvedValue({ _id: 'q7', name: 'DE-1-2-3-2024' });
    model.create.mockResolvedValue({ _id: 'b7', toObject: () => ({ ok: true }) });

    await service.create(
      { l1a: 'de', lv1a: 1, z1a: 2, nr1a: 3, j1a: 2024, anpaarTyp: 4 } as any,
      'u1',
    );

    expect(queenModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        matingType: 'Inselbegattung',
      }),
    );
  });

  it('assigns selected hive to queen when hiveId is provided', async () => {
    const queenDoc = {
      _id: 'q8',
      name: 'Q-8',
      status: 'spare',
      hiveHistory: [],
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    queenModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(queenDoc) });
    model.create.mockResolvedValue({ _id: 'b8', toObject: () => ({ ok: true }) });

    await service.create(
      { queenId: 'q8', hiveId: 'hive-1', notes: 'x' } as any,
      'u1',
    );

    expect(queenDoc.save).toHaveBeenCalled();
    expect(queenDoc.status).toBe('active');
    expect(Array.isArray(queenDoc.hiveHistory)).toBe(true);
    expect(queenDoc.hiveHistory[0]).toEqual(
      expect.objectContaining({
        hiveId: 'hive-1',
      }),
    );
  });

  it('imports CSV rows and maps mandatory fields', async () => {
    queenModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'q3', name: 'DE-1-2-3-2024' }) });
    model.create.mockResolvedValue({ _id: 'b3', toObject: () => ({ ok: true }) });

    const csv = [
      'NST;ANPAARTYP;L1A;LV1A;Z1A;NR1A;J1A;LINIE;BEMERK;BIMI1;BIMIGR1;BIMID1',
      '7;2;DE;1;2;3;2024;Carnica;Notiz;15;50;10.06',
    ].join('\n');

    const res = await service.importCsv(csv, 'u1');

    expect(res.imported).toBe(1);
    expect(res.failed).toBe(0);
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        nst: 7,
        anpaarTyp: 2,
        code1a: 'DE-1-2-3-2024',
        line: 'Carnica',
      }),
    );
  });

  it('reports CSV validation errors for missing mandatory fields', async () => {
    const csv = [
      'NST;L1A;LV1A;Z1A;NR1A;J1A',
      '7;DE;1;2;3;2024',
    ].join('\n');

    const res = await service.importCsv(csv, 'u1');

    expect(res.imported).toBe(0);
    expect(res.failed).toBe(1);
    expect(String(res.errors[0])).toContain('ANPAARTYP or PAARTYP is required');
  });

  it('previews CSV without writing and returns preview summary', () => {
    const csv = [
      'NST;ANPAARTYP;L1A;LV1A;Z1A;NR1A;J1A',
      '7;2;DE;1;2;3;2024',
      ';;DE;1;2;3;2024',
    ].join('\n');

    const preview = service.previewCsv(csv);

    expect(preview.total).toBe(2);
    expect(preview.valid).toBe(1);
    expect(preview.invalid).toBe(1);
    expect(Array.isArray(preview.previewRows)).toBe(true);
    expect(preview.previewRows[0].status).toBe('valid');
    expect(preview.previewRows[1].status).toBe('invalid');
  });

  it('exports BeeBreed-compatible CSV', async () => {
    const docs = [
      {
        _id: 'b4',
        userId: 'u1',
        nst: 7,
        anpaarTyp: 2,
        l1a: 'DE',
        lv1a: 1,
        z1a: 2,
        nr1a: 3,
        j1a: 2024,
        line: 'Carnica',
        notes: 'Notiz',
        bimiSeries: [{ nr: 1, value: 15, gramm: 50, dateRaw: '10.06' }],
        bomiSeries: [{ nr: 1, value: 20, days: 14, dateRaw: '11.06' }],
      },
    ];

    model.find.mockReturnValue({
      sort: () => ({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(docs),
        }),
      }),
    });

    const csv = await service.exportCsv('u1', {});

    expect(csv).toContain('NST;ANPAARTYP;L1A;LV1A;Z1A;NR1A;J1A;1A;LINIE;BEMERK');
    expect(csv).toContain('7;2;DE;1;2;3;2024;DE-1-2-3-2024;Carnica;Notiz');
    expect(csv).toContain(';15;50;10.06;20;14;11.06');
  });

});
