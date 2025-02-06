import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES } from '../config/constants/messages';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes por ventana de tiempo
  message: {
    status: 429,
    message: ERROR_MESSAGES.RATE_LIMITER.TOO_MANY_REQUESTS,
  },
});