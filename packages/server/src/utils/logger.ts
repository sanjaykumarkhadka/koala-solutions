import { env } from '../config/index.js';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  reset: '\x1b[0m',
};

function shouldLog(level: LogLevel): boolean {
  return levels[level] <= levels[env.LOG_LEVEL];
}

function formatMessage(level: LogLevel, message: string, meta?: object): string {
  const timestamp = new Date().toISOString();
  const color = colors[level];
  const levelStr = level.toUpperCase().padEnd(5);

  let output = `${color}[${timestamp}] ${levelStr}${colors.reset}: ${message}`;

  if (meta && Object.keys(meta).length > 0) {
    output += ` ${JSON.stringify(meta)}`;
  }

  return output;
}

export const logger = {
  error(message: string, meta?: object): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  },

  warn(message: string, meta?: object): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  info(message: string, meta?: object): void {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta));
    }
  },

  debug(message: string, meta?: object): void {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, meta));
    }
  },
};
