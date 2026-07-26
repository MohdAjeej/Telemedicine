import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDatabase(retriesLeft = MAX_RETRIES): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${(error as Error).message}`);
    if (retriesLeft === 0) {
      throw error;
    }
    logger.warn(`Retrying MongoDB connection in ${RETRY_DELAY_MS}ms (${retriesLeft} left)`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    await connectDatabase(retriesLeft - 1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
