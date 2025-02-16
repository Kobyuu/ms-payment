import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minuto
  max: 500,                 // Aumentar de 300 a 500
  message: {
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: ERROR_MESSAGES.GENERAL.RATE_LIMIT_EXCEEDED
  },
});

export default limiter;