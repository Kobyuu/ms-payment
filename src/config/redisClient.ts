import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { RedisConfig } from '../types/types';

const parseRedisUrl = (url: string): RedisConfig => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || CONFIG.REDIS_HOST,
      port: parseInt(redisUrl.port || CONFIG.REDIS_PORT.toString(), 10)
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.REDIS.URL_PARSE, error);
    return {
      host: CONFIG.REDIS_HOST,
      port: CONFIG.REDIS_PORT
    };
  }
};

const redisConfig = parseRedisUrl(CONFIG.REDIS_URL);

const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times: number): number => {
        return Math.min(
          times * CONFIG.RETRY_DELAY, 
          CONFIG.REDIS_RETRY_DELAY
        );
      }
    });

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS.CONNECTION_SUCCESS);
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS.CONNECTION_ERROR, err);
});

export default redisClient;