import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 solicitudes por ventana de tiempo
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});