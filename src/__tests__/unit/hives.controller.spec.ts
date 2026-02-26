import { HiveController } from '../../hives/hives.controller';
import { BadRequestException } from '@nestjs/common';

describe('HiveController (unit)', () => {
  let controller: HiveController;
  let hiveService: any;
  const user = { id: 'uid' };

  beforeEach(() => {
    hiveService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new HiveController(hiveService);
  });

  describe('create', () => {
    it('throws if hiveNumber missing', async () => {
      await expect(controller.create({} as any, user)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('calls service.create on valid dto', async () => {
      const dto = { hiveNumber: 'H1', apiaryId: 'a' } as any;
      hiveService.create.mockResolvedValue({ id: 'h1' });
      const res = await controller.create(dto, user);
      expect(res).toEqual({ id: 'h1' });
      expect(hiveService.create).toHaveBeenCalledWith(dto, 'uid');
    });

    it('throws if apiaryId missing', async () => {
      await expect(
        controller.create(
          {
            hiveNumber: 'H2',
          } as any,
          user,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('findAll builds filter and returns service result', async () => {
    hiveService.findAll.mockResolvedValue({ items: [] });
    const result = await controller.findAll(user, 'api', 'active', '2', '5');
    expect(hiveService.findAll).toHaveBeenCalledWith(
      { apiaryId: 'api', status: 'active' },
      'uid',
      2,
      5,
    );
    expect(result).toEqual({ items: [] });
  });

  it('uses default parameters and logs missing pagination', async () => {
    hiveService.findAll.mockResolvedValue({});
    const spyDebug = jest.spyOn((controller as any).logger, 'debug');
    await controller.findAll(user);
    expect(hiveService.findAll).toHaveBeenCalledWith({}, 'uid', 1, 25);
    expect(spyDebug).toHaveBeenCalledWith(expect.stringContaining('returned 0 total'));
  });

  it('findOne forwards to service', async () => {
    hiveService.findOne.mockResolvedValue({ id: 'x' });
    const r = await controller.findOne('x', user);
    expect(r).toEqual({ id: 'x' });
  });

  it('update forwards fields', async () => {
    hiveService.update.mockResolvedValue({ ok: true });
    const r = await controller.update('x', { notes: 'n' }, user);
    expect(hiveService.update).toHaveBeenCalledWith('x', { notes: 'n' }, 'uid');
    expect(r).toEqual({ ok: true });
  });

  it('remove forwards to service', async () => {
    hiveService.remove.mockResolvedValue({ deleted: true });
    const r = await controller.remove('id', user);
    expect(hiveService.remove).toHaveBeenCalledWith('id', 'uid');
    expect(r).toEqual({ deleted: true });
  });
});