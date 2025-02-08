import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG } from './constants/environment';
import { ERROR_MESSAGES, DYNAMIC_MESSAGES } from './constants';
import { cacheService } from '../services/redisCacheService';

// Crear la instancia de axios
const axiosClient = axios.create({
  baseURL: CONFIG.PRODUCT_SERVICE_URL,
  timeout: 5000,
});

// Configurar axios-retry
axiosRetry(axiosClient, {
  retries: CONFIG.RETRY_COUNT,
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * CONFIG.RETRY_DELAY;
  },
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) || 
      (error.response?.status ?? 0) >= 500
    );
  },
});

// Configurar interceptores
axiosClient.interceptors.response.use(
  async (response) => {
    if (response.config.method === 'get') {
      const cacheKey = `cache:${response.config.url}`;
      const cachedData = await cacheService.getFromCache(cacheKey);
      if (!cachedData) {
        await cacheService.setToCache(cacheKey, response.data);
      }
    }
    return response;
  },
  (error) => {
    console.error(ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE, error);
    return Promise.reject(error);
  }
);

export default axiosClient;