import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize-typescript';
import PaymentService from '../services/paymentService';
import Payments from '../models/Payment.model';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { calculateTotalPrice } from '../utils/utils';
import redisClient from '../config/redisClient';

// Mock Sequelize
jest.mock('sequelize-typescript', () => {
  const actualSequelize = jest.requireActual('sequelize-typescript');
  return {
    ...actualSequelize,
    Sequelize: jest.fn(() => ({
      authenticate: jest.fn(),
      transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
      })),
    })),
  };
});

// Mocks
jest.mock('../models/Payment.model', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../utils/utils');

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

});