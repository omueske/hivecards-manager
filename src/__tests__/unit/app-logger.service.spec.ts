import { getLogLevels, AppLogger } from '../../common/app-logger.service';

describe('AppLogger utilities', () => {
  beforeEach(() => {
    delete process.env.LOG_LEVEL;
  });

  it('getLogLevels defaults to INFO', () => {
    expect(getLogLevels()).toEqual(['fatal', 'error', 'warn', 'log']);
  });

  it('getLogLevels respects DEBUG', () => {
    process.env.LOG_LEVEL = 'debug';
    expect(getLogLevels()).toContain('debug');
  });

  it('getLogLevels supports multiple levels', () => {
    process.env.LOG_LEVEL = 'warn';
    expect(getLogLevels()).toEqual(expect.arrayContaining(['warn']));
    process.env.LOG_LEVEL = 'error';
    expect(getLogLevels()).toEqual(expect.arrayContaining(['error']));
    process.env.LOG_LEVEL = 'fatal';
    expect(getLogLevels()).toEqual(expect.arrayContaining(['fatal']));
  });

  it('all log methods write to appropriate streams', () => {
    const logger = new AppLogger();
    const out = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const err = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    logger.warn('w');
    logger.debug('d');
    logger.verbose('v');
    logger.fatal('f');
    expect(out).toHaveBeenCalled();
    expect(err).toHaveBeenCalled();
    out.mockRestore();
    err.mockRestore();
  });
});

describe('AppLogger class', () => {
  let logger: AppLogger;
  beforeEach(() => {
    logger = new AppLogger('ctx');
  });

  it('formatLine includes message and context', () => {
    const line = (logger as any).formatLine('log', 'hello', 'CTX');
    expect(line).toContain('hello');
    expect(line).toContain('[ INFO]');
  });

  it('log writes to stdout', () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    logger.log('test');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('error writes to stderr', () => {
    const spy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    logger.error('err');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});