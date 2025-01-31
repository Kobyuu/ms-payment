import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants/messages';

// Validar las variables de entorno requeridas
['DATABASE_URL', 'INVENTORY_SERVICE_URL', 'PRODUCT_SERVICE_URL', 'REDIS_HOST', 'REDIS_PORT'].forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`${ERROR_MESSAGES.GENERAL.ENV_VAR_NOT_DEFINED}: ${env}`);
  }
});