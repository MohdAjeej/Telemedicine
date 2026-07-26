import morgan from 'morgan';
import { isProduction } from '../config/env';
import { morganStream } from '../utils/logger';

export const requestLogger = morgan(isProduction ? 'combined' : 'dev', { stream: morganStream });
