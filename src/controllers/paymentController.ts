import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

class PaymentController {
  static async getPayments(req: Request, res: Response): Promise<Response> {
    try {
      const payments = await PaymentService.getPayments();
      return res.status(200).json({ data: payments });
    } catch (error) {
      console.error('Error en getPayments:', error.message);
      return res.status(500).json({ error: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR });
    }
  }

  static async getPaymentById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const payment = await PaymentService.getPaymentById(Number(id));
      if (!payment) {
        return res.status(404).json({ message: ERROR_MESSAGES.PAYMENT.NOT_FOUND });
      }
      return res.status(200).json(payment);
    } catch (error) {
      console.error('Error en getPaymentById:', error.message);
      return res.status(500).json({ message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error });
    }
  }

  static async processPayment(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, payment_method } = req.body;

    console.log('Procesando pago:', { product_id, quantity, payment_method }); // Agrega este log

    if (!product_id || quantity <= 0 || !payment_method) {
      console.error('Error de validación en el controlador: Campos obligatorios faltantes');
      return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS });
    }

    try {
      const newPayment = await PaymentService.processPayment(product_id, quantity, payment_method);
      return res.status(201).json(newPayment);
    } catch (error) {
      console.error('Error en processPayment:', error.message);
      return res.status(500).json({ message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR });
    }
  }

  static async compensatePayment(req: Request, res: Response): Promise<Response> {
    const { paymentId } = req.params;

    try {
      const message = await PaymentService.compensatePayment(Number(paymentId));
      return res.json({ message: SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS });
    } catch (error) {
      console.error('Error al revertir el pago:', error.message);
      return res.status(500).json({ error: ERROR_MESSAGES.PAYMENT.REVERT_ERROR });
    }
  }
}

export default PaymentController;
