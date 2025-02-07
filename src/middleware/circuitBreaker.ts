import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS, CIRCUIT_BREAKER_MESSAGES } from '../config/constants';

const options = {
  timeout: 3000, // Si la operación tarda más de 3 segundos, se considera un fallo
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000 // El circuito se cierra después de 30 segundos
};

class CustomCircuitBreaker {
  private breaker: CircuitBreaker;

  constructor(operation: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    this.breaker = new CircuitBreaker(operation, options);

    this.breaker.fallback(() => {
      throw new Error(ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE);
    });

    this.breaker.on('open', () => console.log(CIRCUIT_BREAKER_MESSAGES.OPEN));
    this.breaker.on('halfOpen', () => console.log(CIRCUIT_BREAKER_MESSAGES.HALF_OPEN));
    this.breaker.on('close', () => console.log(CIRCUIT_BREAKER_MESSAGES.CLOSED));
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
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE });
    }
  };
};