import { Request, Response, NextFunction } from 'express';
import CircuitBreaker from 'opossum';

const options = {
  timeout: 3000, // Si la función tarda más de 3 segundos, se considera un fallo
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000, // Después de 30 segundos, el circuito se cierra de nuevo
};

const breaker = new CircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
  next();
}, options);

export const circuitBreakerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  breaker.fire(req, res, next).catch((error) => {
    res.status(503).json({ message: 'Service Unavailable' });
  });
};