import PaymentService from '../services/paymentService';
import Payments from '../models/Payment.model';
import sequelize from '../config/db';
import { ERROR_MESSAGES } from '../config/constants';
import { calculateTotalPrice } from '../utils/utils';

jest.mock('../models/Payment.model');
jest.mock('../config/db');
jest.mock('../utils/utils');

describe('PaymentService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPayments', () => {
    it('should return all payments', async () => {
      const mockPayments = [{ id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' }];
      (Payments.findAll as jest.Mock).mockResolvedValue(mockPayments);

      const payments = await PaymentService.getPayments();

      expect(payments).toEqual(mockPayments);
    });

    it('should throw an error if fetching payments fails', async () => {
      (Payments.findAll as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(PaymentService.getPayments()).rejects.toThrow('Error');
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by ID', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      (Payments.findByPk as jest.Mock).mockResolvedValue(mockPayment);

      const payment = await PaymentService.getPaymentById(1);

      expect(payment).toEqual(mockPayment);
    });

    it('should return null if payment not found', async () => {
      (Payments.findByPk as jest.Mock).mockResolvedValue(null);

      const payment = await PaymentService.getPaymentById(1);

      expect(payment).toBeNull();
    });
  });

  describe('processPayment', () => {
    it('should process a new payment', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };

      (calculateTotalPrice as jest.Mock).mockReturnValue(100);
      (Payments.create as jest.Mock).mockResolvedValue(mockPayment);

      const payment = await PaymentService.processPayment(1, 2, 'tarjeta');

      expect(payment).toEqual(mockPayment);
    });

    it('should rollback transaction if an error occurs', async () => {
      const transaction = { rollback: jest.fn(), commit: jest.fn() };
      (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
      (Payments.create as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(PaymentService.processPayment(1, 2, 'tarjeta')).rejects.toThrow('Error');
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe('compensatePayment', () => {
    it('should compensate a payment', async () => {
      const mockPayment = { id: 1, destroy: jest.fn() };
      const transaction = { rollback: jest.fn(), commit: jest.fn() };
      (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
      (Payments.findByPk as jest.Mock).mockResolvedValue(mockPayment);

      const message = await PaymentService.compensatePayment(1);

      expect(message).toBe('Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.');
      expect(mockPayment.destroy).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
    });

    it('should throw an error if payment not found', async () => {
      const transaction = { rollback: jest.fn(), commit: jest.fn() };
      (sequelize.transaction as jest.Mock).mockResolvedValue(transaction);
      (Payments.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(PaymentService.compensatePayment(1)).rejects.toThrow(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });
});