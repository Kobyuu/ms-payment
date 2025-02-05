import { Request, Response, NextFunction } from 'express';
import { withCircuitBreaker, breakers } from '../middleware/circuitBreaker';
import { ERROR_MESSAGES } from '../config/constants';

jest.mock('opossum');

describe('Circuit Breaker Middleware', () => {
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next function when circuit is closed', async () => {
    breakers.getAllPayments.fire = jest.fn().mockResolvedValueOnce(undefined);

    await withCircuitBreaker('getAllPayments')(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 503 when circuit is open', async () => {
    breakers.getAllPayments.fire = jest.fn().mockRejectedValueOnce(new Error(ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE));

    await withCircuitBreaker('getAllPayments')(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE });
  });
});