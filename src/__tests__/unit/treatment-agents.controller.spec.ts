import { TreatmentAgentsController } from '../../treatment-agents/treatment-agents.controller';

describe('TreatmentAgentsController (unit)', () => {
  let ctrl: TreatmentAgentsController;
  let svc: any;
  const user = { id: 'uid' };

  beforeEach(() => {
    svc = {
      findAllForUser: jest.fn(),
      create: jest.fn(),
    };
    ctrl = new TreatmentAgentsController(svc);
  });

  it('findAllForUser calls service with default category', () => {
    svc.findAllForUser.mockReturnValue([]);
    expect(ctrl.findAll(undefined as any, user)).toEqual([]);
    expect(svc.findAllForUser).toHaveBeenCalledWith('uid', 'treatment');
  });

  it('create forwards dto', () => {
    svc.create.mockReturnValue({ id: 'a' });
    expect(ctrl.create({ name: 'foo' } as any, user)).toEqual({ id: 'a' });
    expect(svc.create).toHaveBeenCalledWith({ name: 'foo' } as any, 'uid');
  });
});