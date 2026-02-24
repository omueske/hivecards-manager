import { QueensController } from '../../queens/queens.controller';

describe('QueensController (unit)', () => {
  let ctrl: QueensController;
  let svc: any;
  const user = { id: 'uid' };

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByHive: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      assignToHive: jest.fn(),
      removeFromHive: jest.fn(),
      remove: jest.fn(),
    };
    ctrl = new QueensController(svc);
  });

  it('create forwards', async () => {
    svc.create.mockResolvedValue({ id: 'q1' });
    expect(await ctrl.create({} as any, user)).toEqual({ id: 'q1' });
    expect(svc.create).toHaveBeenCalledWith({} as any, 'uid');
  });

  it('create logs provided status and passes through', async () => {
    svc.create.mockResolvedValue({ id: 'q2', status: 'mated' });
    const spy = jest.spyOn((ctrl as any).logger, 'debug');
    const dto: any = { status: 'mated' };
    expect(await ctrl.create(dto, user)).toEqual({ id: 'q2', status: 'mated' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('status=mated'));
  });

  it('findAll calls findByHive when hiveId provided', () => {
    svc.findByHive.mockReturnValue([]);
    expect(ctrl.findAll('h', user)).toEqual([]);
    expect(svc.findByHive).toHaveBeenCalledWith('h', 'uid');
  });

  it('findAll calls findAll when no hiveId', () => {
    svc.findAll.mockReturnValue([]);
    expect(ctrl.findAll(undefined as any, user)).toEqual([]);
    expect(svc.findAll).toHaveBeenCalledWith('uid');
  });

  it('findOne forwards', () => {
    svc.findOne.mockReturnValue({ id: 'x' });
    expect(ctrl.findOne('x', user)).toEqual({ id: 'x' });
  });

  it('update forwards', async () => {
    svc.update.mockResolvedValue({ ok: true });
    expect(await ctrl.update('x', { foo: 'bar' } as any, user)).toEqual({ ok: true });
  });

  it('assignToHive forwards', async () => {
    svc.assignToHive.mockResolvedValue({});
    expect(await ctrl.assignToHive('x', { hiveId: 'h' } as any, user)).toEqual({});
  });

  it('assignToHive logs provided from date', async () => {
    svc.assignToHive.mockResolvedValue({});
    const spy = jest.spyOn((ctrl as any).logger, 'debug');
    await ctrl.assignToHive('x', { hiveId: 'h', from: '2020-01-01' } as any, user);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('from=2020-01-01'));
  });

  it('removeFromHive forwards', async () => {
    svc.removeFromHive.mockResolvedValue({});
    expect(await ctrl.removeFromHive('x', { to: 'now' } as any, user)).toEqual({});
  });

  it('removeFromHive logs now when no to date', async () => {
    svc.removeFromHive.mockResolvedValue({});
    const spy = jest.spyOn((ctrl as any).logger, 'debug');
    await ctrl.removeFromHive('x', {} as any, user);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('to=now'));
  });

  it('remove forwards', async () => {
    svc.remove.mockResolvedValue(undefined);
    await expect(ctrl.remove('x', user)).resolves.toBeUndefined();
  });
});