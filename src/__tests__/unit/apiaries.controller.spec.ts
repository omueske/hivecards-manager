import { ApiariesController } from '../../apiaries/apiaries.controller';

describe('ApiariesController (unit)', () => {
  let controller: ApiariesController;
  let svc: any;
  const user = { id: 'uid' };

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new ApiariesController(svc);
  });

  it('create forwards dto to service', async () => {
    const dto = { name: 'foo' } as any;
    svc.create.mockResolvedValue({ id: 'a1' });
    const res = await controller.create(dto, user);
    expect(res).toEqual({ id: 'a1' });
    expect(svc.create).toHaveBeenCalledWith(dto, 'uid');
  });

  it('findAll returns list', async () => {
    svc.findAll.mockResolvedValue([{ id: 'a' }]);
    expect(await controller.findAll(user)).toEqual([{ id: 'a' }]);
  });

  it('findOne forwards', async () => {
    svc.findOne.mockResolvedValue({ id: 'x' });
    expect(await controller.findOne('x', user)).toEqual({ id: 'x' });
  });

  it('update forwards', async () => {
    svc.update.mockResolvedValue({ ok: true });
    expect(await controller.update('x', { foo: 'bar' } as any, user)).toEqual({ ok: true });
    expect(svc.update).toHaveBeenCalledWith('x', { foo: 'bar' }, 'uid');
  });

  it('remove forwards', async () => {
    svc.remove.mockResolvedValue({ ok: true });
    expect(await controller.remove('x', user)).toEqual({ ok: true });
  });
});