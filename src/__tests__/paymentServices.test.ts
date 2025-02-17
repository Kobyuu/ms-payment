import PaymentService from '../services/paymentService';
import Payments from '../models/Payment.model';
import ProductService from '../services/productService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { calculateTotalPrice } from '../utils/utils';
import redisClient from '../config/redisClient';

// Mock de Sequelize para pruebas
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

// Mocks de dependencias
jest.mock('../models/Payment.model');
jest.mock('../utils/utils');
jest.mock('../services/productService');

describe('PaymentService', () => {
  // Limpia los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Cierra conexión Redis al finalizar
  afterAll(async () => {
    await redisClient.quit();
  });

  // Pruebas para obtener todos los pagos
  describe('getPayments', () => {
    // Caso exitoso: lista de pagos
    it('should return all payments', async () => {
      const mockPayments = [{ id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' }];
      (Payments.findAll as jest.Mock).mockResolvedValue(mockPayments);

      const result = await PaymentService.getPayments();
      expect(result).toEqual(mockPayments);
    });

    // Caso error: fallo al obtener pagos
    it('should throw an error if fetching payments fails', async () => {
      (Payments.findAll as jest.Mock).mockRejectedValue(new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR));
      await expect(PaymentService.getPayments()).rejects.toThrow(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    });
  });

  // Pruebas para obtener pago por ID
  describe('getPaymentById', () => {
    // Caso exitoso: obtener pago específico
    it('should return payment by ID', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      (Payments.findByPk as jest.Mock).mockResolvedValue(mockPayment);

      const result = await PaymentService.getPaymentById(1);
      expect(result).toEqual(mockPayment);
    });

    // Caso: pago no encontrado
    it('should return null if payment not found', async () => {
      (Payments.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await PaymentService.getPaymentById(999);
      expect(result).toBeNull();
    });

    // Caso error: fallo en la búsqueda
    it('should throw an error if fetching payment fails', async () => {
      (Payments.findByPk as jest.Mock).mockRejectedValue(new Error(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR));
      await expect(PaymentService.getPaymentById(1)).rejects.toThrow(ERROR_MESSAGES.PAYMENT.GET_PAYMENTS_ERROR);
    });
  });

  // Pruebas para procesar pagos
  describe('processPayment', () => {
    // Caso exitoso: procesar pago
    it('should process payment successfully', async () => {
      const mockProduct = { data: { id: 1, price: 50 }, statusCode: 200 };
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      
      (ProductService.getProductById as jest.Mock).mockResolvedValue(mockProduct);
      (calculateTotalPrice as jest.Mock).mockReturnValue(100);
      (Payments.create as jest.Mock).mockResolvedValue(mockPayment);

      const result = await PaymentService.processPayment(1, 2, 'tarjeta');
      expect(result).toEqual(mockPayment);
    });

    // Caso error: cantidad inválida
    it('should throw error if invalid quantity', async () => {
      await expect(PaymentService.processPayment(1, 0, 'tarjeta'))
        .rejects.toThrow(ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY);
    });

    // Caso error: producto no encontrado
    it('should throw error if product not found', async () => {
      (ProductService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: 404, 
        data: null 
      });

      await expect(PaymentService.processPayment(999, 1, 'tarjeta'))
        .rejects.toThrow(ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND);
    });

    it('should throw error if invalid price', async () => {
      (ProductService.getProductById as jest.Mock).mockResolvedValue({ 
        data: { id: 1, price: -50 }, 
        statusCode: 200 
      });

      await expect(PaymentService.processPayment(1, 1, 'tarjeta'))
        .rejects.toThrow(ERROR_MESSAGES.PAYMENT.INVALID_PRICE);
    });
  });

  // Pruebas para compensación de pagos
  describe('compensatePayment', () => {
    // Caso exitoso: compensar pago
    it('should compensate payment successfully', async () => {
      const mockPayment = { 
        id: 1, 
        product_id: 1, 
        price: 100, 
        payment_method: 'tarjeta',
        destroy: jest.fn().mockResolvedValue(undefined) // Add mock destroy method
      };
      
      (Payments.findByPk as jest.Mock).mockResolvedValue(mockPayment);

      const result = await PaymentService.compensatePayment(1);
      
      expect(result).toBe(SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS);
      expect(mockPayment.destroy).toHaveBeenCalledWith(expect.objectContaining({
        transaction: expect.any(Object)
      }));
    });

    // Caso error: pago no encontrado
    it('should throw error if payment not found', async () => {
      (Payments.findByPk as jest.Mock).mockResolvedValue(null);
      
      await expect(PaymentService.compensatePayment(999))
        .rejects.toThrow(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
    });
  });
});