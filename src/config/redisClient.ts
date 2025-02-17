import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { RedisConfig } from '../types/types';

// Analiza la URL de Redis y extrae la configuración
const parseRedisUrl = (url: string): RedisConfig => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || CONFIG.REDIS_HOST,      // Usa hostname de URL o valor por defecto
      port: parseInt(redisUrl.port || CONFIG.REDIS_PORT.toString(), 10)  // Usa puerto de URL o valor por defecto
    };
  } catch (error) {
    // Si hay error en el parseo, usa configuración por defecto
    console.error(ERROR_MESSAGES.REDIS.URL_PARSE, error);
    return {
      host: CONFIG.REDIS_HOST,
      port: CONFIG.REDIS_PORT
    };
  }
};

// Obtiene la configuración de Redis desde la URL
const redisConfig = parseRedisUrl(CONFIG.REDIS_URL);

// Crea cliente Redis (mock para tests, real para producción)
const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      // Estrategia de reintentos exponencial con límite
      retryStrategy: (times: number): number => {
        return Math.min(
          times * CONFIG.RETRY_DELAY, 
          CONFIG.REDIS_RETRY_DELAY
        );
      }
    });

// Manejador de conexión exitosa
redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS.CONNECTION_SUCCESS);
});

// Manejador de errores de conexión
redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS.CONNECTION_ERROR, err);
});

export default redisClient;