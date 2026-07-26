import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import { loggerConfig } from '../config/logger.config';

const logsDir = path.resolve(process.cwd(), loggerConfig.logsDir);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `${ts} [${level}] ${stack ?? message}`),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: loggerConfig.level,
  format: loggerConfig.json ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
  ],
  exitOnError: false,
});

export const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
