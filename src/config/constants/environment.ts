import { validateEnv } from '../validateEnv';
import { DEFAULTS } from './defaults';

// Valida las variables de entorno requeridas
validateEnv();

// Extrae variables de entorno del proceso
const {
  DATABASE_URL,
  PRODUCT_SERVICE_URL,
  REDIS_URL,
  RETRY_COUNT,
  RETRY_DELAY, 
  CACHE_EXPIRY,
  PORT,
  OUTPUT_STOCK,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_RETRY_DELAY,
  PRODUCT_SERVICE_TIMEOUT,
  DATABASE_POOL_MAX_CONNECTIONS,
  DATABASE_POOL_MIN_CONNECTIONS,
  DATABASE_POOL_IDLE_TIME,
  DATABASE_POOL_ACQUIRE_TIMEOUT,
  DIALECT ,
  MODELS_PATH,
  LOGGING,
} = process.env;

// Configuración global de la aplicación con valores por defecto
export const CONFIG = {
  // Configuración de base de datos
  DATABASE_URL: DATABASE_URL || DEFAULTS.DATABASE_URL,
  DATABASE_POOL_MAX_CONNECTIONS: parseInt(DATABASE_POOL_MAX_CONNECTIONS || DEFAULTS.DATABASE_POOL_MAX_CONNECTIONS.toString(), 10),
  DATABASE_POOL_MIN_CONNECTIONS: parseInt(DATABASE_POOL_MIN_CONNECTIONS || DEFAULTS.DATABASE_POOL_MIN_CONNECTIONS.toString(), 10),
  DATABASE_POOL_IDLE_TIME: parseInt(DATABASE_POOL_IDLE_TIME || DEFAULTS.DATABASE_POOL_IDLE_TIME.toString(), 10),
  DATABASE_POOL_ACQUIRE_TIMEOUT: parseInt(DATABASE_POOL_ACQUIRE_TIMEOUT || DEFAULTS.DATABASE_POOL_ACQUIRE_TIMEOUT.toString(), 10),
  
  // Configuración del servicio de productos
  PRODUCT_SERVICE_URL: PRODUCT_SERVICE_URL || DEFAULTS.PRODUCT_SERVICE_URL,
  PRODUCT_SERVICE_TIMEOUT: parseInt(PRODUCT_SERVICE_TIMEOUT || DEFAULTS.PRODUCT_SERVICE_TIMEOUT.toString(), 10),

  // Configuración de Redis
  REDIS_URL: REDIS_URL || DEFAULTS.REDIS_URL,
  REDIS_HOST: REDIS_HOST || DEFAULTS.REDIS_HOST,
  REDIS_PORT: parseInt(REDIS_PORT || DEFAULTS.REDIS_PORT.toString(), 10),
  REDIS_RETRY_DELAY: parseInt(REDIS_RETRY_DELAY || DEFAULTS.REDIS_RETRY_DELAY.toString(), 10),

  // Configuración de reintentos
  RETRY_COUNT: parseInt(RETRY_COUNT || DEFAULTS.RETRY_COUNT.toString(), 10),
  RETRY_DELAY: parseInt(RETRY_DELAY || DEFAULTS.RETRY_DELAY.toString(), 10),

  // Configuración de caché
  CACHE_EXPIRY: parseInt(CACHE_EXPIRY || DEFAULTS.CACHE_EXPIRY.toString(), 10),

  // Configuración del servidor
  PORT: parseInt(PORT || DEFAULTS.PORT.toString(), 10),

  // Configuración de stock
  OUTPUT_STOCK: parseInt(OUTPUT_STOCK || DEFAULTS.OUTPUT_STOCK.toString(), 10),

  // Configuración de base de datos adicional
  DIALECT: DIALECT ?? DEFAULTS.DIALECT,
  MODELS_PATH: MODELS_PATH ?? DEFAULTS.MODELS_PATH,
  LOGGING: LOGGING ? LOGGING === 'true' : DEFAULTS.LOGGING,
} as const;