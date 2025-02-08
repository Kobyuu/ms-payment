import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants';

// Validar las variables de entorno requeridas
[
  'DATABASE_URL',
  'PRODUCT_SERVICE_URL',
  'REDIS_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_RETRY_DELAY',
  'RETRY_COUNT',
  'RETRY_DELAY',
  'CACHE_EXPIRY',
  'PORT',
  'OUTPUT_STOCK'
].forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`${ERROR_MESSAGES.GENERAL.ENV_VAR_NOT_DEFINED}: ${env}`);
  }
});