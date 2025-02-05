import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';
import { HTTP_STATUS } from '../config/constants/httpStatus';

class PaymentController {
  static async getPayments(req: Request, res: Response): Promise<Response> {
    try {
      const payments = await PaymentService.getPayments();
      return res.status(HTTP_STATUS.OK).json({ data: payments });
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR });
    }
  }

  static async getPaymentById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const payment = await PaymentService.getPaymentById(Number(id));
      if (!payment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.PAYMENT.NOT_FOUND });
      }
      return res.status(HTTP_STATUS.OK).json(payment);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error.message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error });
    }
  }

  static async processPayment(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, payment_method } = req.body;

    console.log('Procesando pago:', { product_id, quantity, payment_method });

    if (!product_id || quantity <= 0 || !payment_method) {
      console.error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS });
    }

    try {
      const newPayment = await PaymentService.processPayment(product_id, quantity, payment_method);
      return res.status(HTTP_STATUS.CREATED).json(newPayment);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error.message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR });
    }
  }

  static async compensatePayment(req: Request, res: Response): Promise<Response> {
    const { paymentId } = req.params;

    try {
      const message = await PaymentService.compensatePayment(Number(paymentId));
      return res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS });
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR, error.message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.PAYMENT.REVERT_ERROR });
    }
  }
}

export default PaymentController;
