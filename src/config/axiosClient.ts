import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG } from './constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DYNAMIC_MESSAGES, HTTP_STATUS } from './constants';
import { cacheService } from '../services/redisCacheService';

// Cliente HTTP configurado para el servicio de productos
const axiosClient = axios.create({
  baseURL: CONFIG.PRODUCT_SERVICE_URL,
  timeout: CONFIG.PRODUCT_SERVICE_TIMEOUT,
});

// Configuración de reintentos para peticiones fallidas
axiosRetry(axiosClient, {
  retries: CONFIG.RETRY_COUNT,
  // Calcula el tiempo de espera entre reintentos
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * CONFIG.RETRY_DELAY;
  },
  // Define condiciones para reintentar peticiones
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ?? 0) >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
  },
});

// Interceptor para verificar y usar caché en peticiones GET
axiosClient.interceptors.request.use(async (config) => {
  const cacheKey = `cache:${config.url}`;
  const cachedData = await cacheService.getFromCache(cacheKey);

  // Si hay datos en caché para GET, los retorna directamente
  if (cachedData && config.method === 'get') {
    config.adapter = async () => {
      return {
        data: cachedData,
        status: HTTP_STATUS.OK,
        statusText: SUCCESS_MESSAGES.GENERAL.OK,
        headers: {},
        config,
        request: {},
      };
    };
  }

  return config;
});

// Interceptor para almacenar respuestas GET en caché
axiosClient.interceptors.response.use(async (response) => {
  // Guarda en caché solo las respuestas GET
  if (response.config.method === 'get') {
    const cacheKey = `cache:${response.config.url}`;
    await cacheService.setToCache(cacheKey, response.data);
  }
  return response;
}, (error) => {
  // Registra y propaga errores HTTP
  console.error(ERROR_MESSAGES.GENERAL.HTTP_REQUEST, error);
  return Promise.reject(error);
});

export default axiosClient;