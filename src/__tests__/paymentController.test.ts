import request from 'supertest';
import server from '../server';
import PaymentService from '../services/paymentService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import redisClient from '../config/redisClient';

// Mock de la conexión a base de datos
jest.mock('../config/db', () => ({
  authenticate: jest.fn().mockResolvedValue(null),
  close: jest.fn().mockResolvedValue(null),
  transaction: jest.fn(),
  __esModule: true,
  default: {
    authenticate: jest.fn().mockResolvedValue(null),
    close: jest.fn().mockResolvedValue(null),
  }
}));

// Mock del servicio de pagos
jest.mock('../services/paymentService');

describe('PaymentController', () => {
  // Configuración inicial de pruebas
  beforeAll(() => {
    console.log('Mocks inicializados');
  });

  // Limpieza después de todas las pruebas
  afterAll(async () => {
    await redisClient.quit();
    console.log('Conexión Redis cerrada');
  });

  // Limpieza después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para obtener todos los pagos
  describe('GET /api/payment', () => {
    // Caso exitoso: obtener lista de pagos
    it('debería devolver todos los pagos', async () => {
      const mockPayments = [{ id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' }];
      (PaymentService.getPayments as jest.Mock).mockResolvedValue(mockPayments);

      const response = await request(server).get('/api/payment');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockPayments);
    });

    // Caso error: fallo al obtener pagos
    it('debería manejar errores al obtener pagos', async () => {
      (PaymentService.getPayments as jest.Mock).mockRejectedValue(new Error('Error al obtener pagos'));

      const response = await request(server).get('/api/payment');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    });
  });

  // Pruebas para obtener pago por ID
  describe('GET /api/payment/:id', () => {
    // Caso exitoso: obtener pago específico
    it('debería devolver un pago por ID', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      (PaymentService.getPaymentById as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(server).get('/api/payment/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPayment);
    });

    // Caso error: fallo al obtener un pago por ID
    it('debería manejar errores al obtener un pago por ID', async () => {
      (PaymentService.getPaymentById as jest.Mock).mockRejectedValue(new Error('Error al obtener pago'));

      const response = await request(server).get('/api/payment/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    });

    // Caso error: pago no encontrado
    it('debería devolver 404 si el pago no se encuentra', async () => {
      (PaymentService.getPaymentById as jest.Mock).mockResolvedValue(null);

      const response = await request(server).get('/api/payment/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
    });
  });

  // Pruebas para crear nuevo pago
  describe('POST /api/payment', () => {
    // Caso exitoso: crear pago
    it('debería procesar un nuevo pago', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      (PaymentService.processPayment as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPayment);
    });

    // Caso error: fallo al procesar un nuevo pago
    it('debería manejar errores al procesar un nuevo pago', async () => {
      (PaymentService.processPayment as jest.Mock).mockRejectedValue(new Error('Error al procesar pago'));

      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    });

    // Casos de validación
    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 0, payment_method: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS);
    });

    it('debería devolver 400 si el ID del producto es inválido', async () => {
      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: -1, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID);
    });

    it('debería devolver 400 si la cantidad es inválida', async () => {
      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: -1, payment_method: 'tarjeta' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY);
    });

    it('debería devolver 400 si el método de pago es inválido', async () => {
      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 2, payment_method: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD);
    });

    // Casos de error de negocio
    it('debería devolver 404 si el producto no existe', async () => {
      (PaymentService.processPayment as jest.Mock)
        .mockRejectedValue(new Error(ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND));

      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 999, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND);
    });

    it('debería devolver 400 si el precio es inválido', async () => {
      (PaymentService.processPayment as jest.Mock)
        .mockRejectedValue(new Error(ERROR_MESSAGES.PAYMENT.INVALID_PRICE));

      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.INVALID_PRICE);
    });
  });

  // Pruebas para revertir pago
  describe('DELETE /api/payment/:paymentId', () => {
    // Caso exitoso: revertir pago
    it('debería revertir un pago', async () => {
      (PaymentService.compensatePayment as jest.Mock).mockResolvedValue(SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS);

      const response = await request(server).delete('/api/payment/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS);
    });

    // Caso error: fallo al revertir un pago
    it('debería manejar errores al revertir un pago', async () => {
      (PaymentService.compensatePayment as jest.Mock).mockRejectedValue(new Error('Error al revertir pago'));

      const response = await request(server).delete('/api/payment/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.REVERT_ERROR);
    });

    // Caso error: pago no encontrado
    it('debería devolver 404 si el pago a revertir no existe', async () => {
      (PaymentService.compensatePayment as jest.Mock)
        .mockRejectedValue(new Error(ERROR_MESSAGES.PAYMENT.NOT_FOUND));

      const response = await request(server).delete('/api/payment/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
    });
  });
});