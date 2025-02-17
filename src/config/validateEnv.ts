import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants';

// Validar las variables de entorno requeridas
export function validateEnv(): void {
  // Lista de variables de entorno necesarias para la aplicación
  const requiredEnvVars = [
    // Configuración de base de datos
    'DATABASE_URL',
    'DATABASE_POOL_MAX_CONNECTIONS',
    'DATABASE_POOL_MIN_CONNECTIONS',
    'DATABASE_POOL_IDLE_TIME',
    'DATABASE_POOL_ACQUIRE_TIMEOUT',

    // Configuración de servicios externos
    'PRODUCT_SERVICE_URL',
    'PRODUCT_SERVICE_TIMEOUT',

    // Configuración de Redis y caché
    'REDIS_URL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_RETRY_DELAY',
    'CACHE_EXPIRY',

    // Configuración de reintentos
    'RETRY_COUNT',
    'RETRY_DELAY',

    // Configuración general
    'PORT',
    'OUTPUT_STOCK',
  ];

  // Verifica la existencia de cada variable requerida
  requiredEnvVars.forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`${ERROR_MESSAGES.GENERAL.ENV_VAR_NOT_DEFINED}: ${env}`);
    }
  });
}
