import { InspectionsController } from '../../inspections/inspections.controller';
import { BadRequestException } from '@nestjs/common';

describe('InspectionsController (unit)', () => {
  let ctrl: InspectionsController;
  let svc: any;
  const user = { id: 'uid' };

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    ctrl = new InspectionsController(svc);
  });

  it('create forwards dto', async () => {
    const dto = { hiveId: 'h1', date: '2026-02-26' } as any;
    svc.create.mockResolvedValue({ id: 'i1' });
    expect(await ctrl.create(dto, user)).toEqual({ id: 'i1' });
    expect(svc.create).toHaveBeenCalledWith(dto, 'uid');
  });

  it('create rejects missing hiveId', async () => {
    await expect(ctrl.create({ date: '2026-02-26' } as any, user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('create rejects missing date', async () => {
    await expect(ctrl.create({ hiveId: 'h1' } as any, user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('create logs and passes explicit type', async () => {
    const dto: any = { hiveId: 'h2', date: '2026-02-26', type: 'inspection' };
    svc.create.mockResolvedValue({ id: 'i2' });
    const spy = jest.spyOn((ctrl as any).logger, 'debug');
    await ctrl.create(dto, user);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('type=inspection'));
  });

  it('findAll uses defaults', () => {
    svc.findAll.mockReturnValue([]);
    expect(ctrl.findAll(undefined as any, undefined as any, undefined as any, user)).toEqual([]);
  });

  it('findAll passes parameters and logs hiveId', () => {
    svc.findAll.mockReturnValue(['ok']);
    const spy = jest.spyOn((ctrl as any).logger, 'debug');
    const result = ctrl.findAll('h100', '2', '10', user);
    expect(result).toEqual(['ok']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('hiveId=h100'));
  });

  it('update forwards', async () => {
    svc.update.mockResolvedValue({});
    expect(await ctrl.update('x', { foo: 'bar' } as any, user)).toEqual({});
  });

  it('remove forwards', async () => {
    svc.remove.mockResolvedValue(undefined);
    await expect(ctrl.remove('x', user)).resolves.toBeUndefined();
  });
});