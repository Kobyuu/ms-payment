import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  RETRY_COUNT: parseInt(process.env.RETRY_COUNT!, 10),
  RETRY_DELAY: parseInt(process.env.RETRY_DELAY!, 10),
  CACHE_EXPIRY: parseInt(process.env.CACHE_EXPIRY!, 10),
  PORT: parseInt(process.env.PORT!, 10),
  OUTPUT_STOCK: parseInt(process.env.OUTPUT_STOCK!) || 2,
  REDIS_HOST: process.env.REDIS_HOST || 'redis',
  REDIS_PORT: parseInt(process.env.REDIS_PORT!) || 6379,
  REDIS_RETRY_DELAY: parseInt(process.env.REDIS_RETRY_DELAY!) || 2000,
};