import PaymentService from '../services/paymentService';
import Payments from '../models/Payment.model';
import { ERROR_MESSAGES } from '../config/constants';
import redisClient from '../config/redisClient';

// Mock Sequelize
jest.mock('../config/db', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };
  
  return {
    __esModule: true,
    default: {
      transaction: jest.fn().mockResolvedValue(mockTransaction),
      addHook: jest.fn(),
      authenticate: jest.fn(),
    },
  };
});

// Mocks
jest.mock('../models/Payment.model');
jest.mock('../utils/utils');
jest.mock('../services/productService');

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  describe('getPayments', () => {
    it('should return all payments', async () => {
      const mockPayments = [{ id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' }];
      (Payments.findAll as jest.Mock).mockResolvedValue(mockPayments);

      const result = await PaymentService.getPayments();
      expect(result).toEqual(mockPayments);
    });

    it('should throw an error if fetching payments fails', async () => {
      (Payments.findAll as jest.Mock).mockRejectedValue(new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR));
      await expect(PaymentService.getPayments()).rejects.toThrow(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    });
  });

  // Add more test cases for other methods
});