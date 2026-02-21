import { ConsoleLogger, ConsoleLoggerOptions, LogLevel } from '@nestjs/common';

/**
 * Maps the LOG_LEVEL environment variable to NestJS log levels.
 *
 * Supported values (case-insensitive): FATAL | ERROR | WARN | INFO | DEBUG
 * Default: INFO
 *
 * Hierarchy (each level includes all levels above it):
 *   FATAL → ERROR → WARN → INFO → DEBUG
 */
export function getLogLevels(): LogLevel[] {
  const level = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
  switch (level) {
    case 'FATAL':
      return ['fatal'];
    case 'ERROR':
      return ['fatal', 'error'];
    case 'WARN':
      return ['fatal', 'error', 'warn'];
    case 'DEBUG':
      return ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];
    case 'INFO':
    default:
      return ['fatal', 'error', 'warn', 'log'];
  }
}

// ANSI color codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const LEVEL_COLOR: Record<string, string> = {
  fatal: `${BOLD}\x1b[35m`,  // bold magenta
  error: `\x1b[31m`,          // red
  warn: `\x1b[33m`,           // yellow
  log: `\x1b[32m`,            // green
  debug: `\x1b[36m`,          // cyan
  verbose: `\x1b[36m`,        // cyan
};

const LEVEL_LABEL: Record<string, string> = {
  fatal: 'FATAL',
  error: 'ERROR',
  warn: ' WARN',
  log: ' INFO',
  debug: 'DEBUG',
  verbose: 'DEBUG',
};

/**
 * Custom application logger with:
 *  - Configurable log level via LOG_LEVEL env variable (FATAL|ERROR|WARN|INFO|DEBUG)
 *  - Colored, categorized output: [FATAL] [ERROR] [WARN] [INFO] [DEBUG]
 *  - ISO timestamp on every line
 *  - FATAL and ERROR written to stderr; INFO/WARN/DEBUG to stdout
 */
export class AppLogger extends ConsoleLogger {
  constructor(context = '', options?: ConsoleLoggerOptions) {
    super(context, { logLevels: getLogLevels(), ...options });
  }

  private formatLine(level: string, message: any, context?: string): string {
    const ts = new Date().toISOString();
    const color = LEVEL_COLOR[level] ?? LEVEL_COLOR.log;
    const label = LEVEL_LABEL[level] ?? ' INFO';
    const ctx = context ?? this.context ?? '';
    const ctxStr = ctx ? ` ${DIM}[${ctx}]${RESET}` : '';
    return `${DIM}${ts}${RESET} ${color}[${label}]${RESET}${ctxStr} ${message}`;
  }

  private write(level: string, message: any, context?: string): void {
    const line = this.formatLine(level, message, context) + '\n';
    if (level === 'error' || level === 'fatal') {
      process.stderr.write(line);
    } else {
      process.stdout.write(line);
    }
  }

  override log(message: any, context?: string): void {
    if (this.isLevelEnabled('log')) this.write('log', message, context);
  }

  override error(message: any, stackOrContext?: string): void {
    if (this.isLevelEnabled('error')) this.write('error', message, stackOrContext);
  }

  override warn(message: any, context?: string): void {
    if (this.isLevelEnabled('warn')) this.write('warn', message, context);
  }

  override debug(message: any, context?: string): void {
    if (this.isLevelEnabled('debug')) this.write('debug', message, context);
  }

  override verbose(message: any, context?: string): void {
    if (this.isLevelEnabled('verbose')) this.write('verbose', message, context);
  }

  override fatal(message: any, context?: string): void {
    if (this.isLevelEnabled('fatal')) this.write('fatal', message, context);
  }
}
