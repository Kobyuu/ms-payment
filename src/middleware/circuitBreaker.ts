import { Request, Response, NextFunction } from 'express';
import CircuitBreaker from 'opossum';
import { ERROR_MESSAGES } from '../config/constants';

const options = {
  timeout: 3000, // Si la función tarda más de 3 segundos, se considera un fallo
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000, // Después de 30 segundos, el circuito se cierra de nuevo
};

class CustomCircuitBreaker {
  private breaker: CircuitBreaker;

  constructor(operation: Function) {
    this.breaker = new CircuitBreaker(operation, options);

    this.breaker.fallback(() => {
      throw new Error(ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE);
    });

    this.breaker.on('open', () => console.log(`Circuit breaker for ${operation.name} is now OPEN`));
    this.breaker.on('halfOpen', () => console.log(`Circuit breaker for ${operation.name} is now HALF_OPEN`));
    this.breaker.on('close', () => console.log(`Circuit breaker for ${operation.name} is now CLOSED`));
  }

  async fire(...args: any[]): Promise<any> {
    return this.breaker.fire(...args);
  }
}

export const breakers = {
  getAllPayments: new CustomCircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
  getPaymentById: new CustomCircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
  processPayment: new CustomCircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
  compensatePayment: new CustomCircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
};

export const withCircuitBreaker = (operation: keyof typeof breakers) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const breaker = breakers[operation];

    try {
      await breaker.fire(req, res, next);
    } catch (error) {
      res.status(503).json({ message: ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE });
    }
  };
};