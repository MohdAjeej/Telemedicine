import { env, isProduction } from './env';

export const loggerConfig = {
  level: env.LOG_LEVEL,
  json: isProduction,
  logsDir: 'src/logs',
};
