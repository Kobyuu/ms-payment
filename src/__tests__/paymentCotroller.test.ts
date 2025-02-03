import request from 'supertest';
import server from '../server';
import PaymentService from '../services/paymentService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import sequelize from '../config/db';

beforeAll(async () => {
  await sequelize.authenticate();
  console.log('Conexión a la base de datos establecida exitosamente.');
});

afterAll(async () => {
  await sequelize.close();
  console.log('Conexión a la base de datos cerrada exitosamente.');
});

// Mock de PaymentService
jest.mock('../services/paymentService');

describe('PaymentController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/payment', () => {
    it('debería devolver todos los pagos', async () => {
      const mockPayments = [{ id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' }];
      (PaymentService.getPayments as jest.Mock).mockResolvedValue(mockPayments);

      const response = await request(server).get('/api/payment');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockPayments);
    });

    it('debería manejar errores al obtener pagos', async () => {
      (PaymentService.getPayments as jest.Mock).mockRejectedValue(new Error('Error al obtener pagos'));

      const response = await request(server).get('/api/payment');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    });
  });

  describe('GET /api/payment/:id', () => {
    it('debería devolver un pago por ID', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      (PaymentService.getPaymentById as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(server).get('/api/payment/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPayment);
    });

    it('debería manejar errores al obtener un pago por ID', async () => {
      (PaymentService.getPaymentById as jest.Mock).mockRejectedValue(new Error('Error al obtener pago'));

      const response = await request(server).get('/api/payment/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    });

    it('debería devolver 404 si el pago no se encuentra', async () => {
      (PaymentService.getPaymentById as jest.Mock).mockResolvedValue(null);

      const response = await request(server).get('/api/payment/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.NOT_FOUND);
    });
  });

  describe('POST /api/payment', () => {
    it('debería procesar un nuevo pago', async () => {
      const mockPayment = { id: 1, product_id: 1, price: 100, payment_method: 'tarjeta' };
      (PaymentService.processPayment as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPayment);
    });

    it('debería manejar errores al procesar un nuevo pago', async () => {
      (PaymentService.processPayment as jest.Mock).mockRejectedValue(new Error('Error al procesar pago'));

      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 2, payment_method: 'tarjeta' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR);
    });

    it('debería devolver 400 si faltan campos obligatorios', async () => {
      const response = await request(server)
        .post('/api/payment')
        .send({ product_id: 1, quantity: 0, payment_method: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS);
    });
  });

  describe('DELETE /api/payment/:paymentId', () => {
    it('debería revertir un pago', async () => {
      (PaymentService.compensatePayment as jest.Mock).mockResolvedValue(SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS);

      const response = await request(server).delete('/api/payment/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS);
    });

    it('debería manejar errores al revertir un pago', async () => {
      (PaymentService.compensatePayment as jest.Mock).mockRejectedValue(new Error('Error al revertir pago'));

      const response = await request(server).delete('/api/payment/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe(ERROR_MESSAGES.PAYMENT.REVERT_ERROR);
    });
  });
});