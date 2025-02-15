import redisClient from '../config/redisClient';
import { CONFIG } from '../config/constants';
import { CacheService } from '../types/types';

class RedisCacheService implements CacheService {
  async getFromCache(key: string): Promise<any> {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  async setToCache(key: string, data: any): Promise<void> {
    await redisClient.set(key, JSON.stringify(data), 'EX', CONFIG.CACHE_EXPIRY);
  }

  async clearCache(keys: string[]): Promise<void> {
    for (const key of keys) {
      await redisClient.del(key);
    }
  }
}

export const cacheService = new RedisCacheService();