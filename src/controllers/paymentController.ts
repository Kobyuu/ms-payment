import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
import { MESSAGES } from '../config/constants/messages';

class PaymentController {
  static async getPayments(req: Request, res: Response): Promise<Response> {
    try {
      const payments = await PaymentService.getPayments();
      return res.status(200).json({ data: payments });
    } catch (error) {
      console.error('Error en getPayments:', error.message);
      return res.status(500).json({ error: MESSAGES.PAYMENT.PROCESS_ERROR });
    }
  }

  static async getPaymentById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const payment = await PaymentService.getPaymentById(Number(id));
      if (!payment) {
        return res.status(404).json({ message: MESSAGES.PAYMENT.NOT_FOUND });
      }
      return res.status(200).json(payment);
    } catch (error) {
      console.error('Error en getPaymentById:', error.message);
      return res.status(500).json({ message: MESSAGES.PAYMENT.PROCESS_ERROR, error });
    }
  }

  static async processPayment(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, payment_method } = req.body;

    if (!product_id || quantity <= 0 || !payment_method) {
      return res.status(400).json({ message: MESSAGES.VALIDATION.REQUIRED_FIELDS });
    }

    try {
      const newPayment = await PaymentService.processPayment(product_id, quantity, payment_method);
      return res.status(201).json(newPayment);
    } catch (error) {
      console.error('Error en processPayment:', error.message);
      return res.status(500).json({ message: MESSAGES.PAYMENT.PROCESS_ERROR });
    }
  }

  static async compensatePayment(req: Request, res: Response): Promise<Response> {
    const { paymentId } = req.params;

    try {
      const message = await PaymentService.compensatePayment(Number(paymentId));
      return res.json({ message });
    } catch (error) {
      console.error('Error al revertir el pago:', error.message);
      return res.status(500).json({ error: MESSAGES.PAYMENT.REVERT_ERROR });
    }
  }
}

export default PaymentController;
