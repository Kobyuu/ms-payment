import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100000, // Limite de 100 solicitudes por IP
  message: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: ERROR_MESSAGES.GENERAL.RATE_LIMIT_EXCEEDED
  },
});

export default limiter;