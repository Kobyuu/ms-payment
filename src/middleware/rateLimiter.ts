import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

// Configuración del limitador de solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // Ventana de tiempo: 1 minuto
  max: 100000,                  // Máximo de solicitudes por ventana
  message: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,  
    message: ERROR_MESSAGES.GENERAL.RATE_LIMIT_EXCEEDED  
  },
  // Opciones adicionales del limitador
  standardHeaders: true,    // Incluye cabeceras estándar de rate limit
  legacyHeaders: false,     // Deshabilita cabeceras heredadas
});

export default limiter;