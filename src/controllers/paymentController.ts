import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
import { ErrorResponse, SuccessResponse } from '../types/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, PAYMENT_METHODS } from '../config/constants';
import { HTTP_STATUS } from '../config/constants/httpStatus';

class PaymentController {
  static async getPayments(req: Request, res: Response): Promise<Response> {
    try {
      const payments = await PaymentService.getPayments();
      return res.status(HTTP_STATUS.OK).json({ data: payments } as SuccessResponse);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error } as ErrorResponse);
    }
  }

  static async getPaymentById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const payment = await PaymentService.getPaymentById(Number(id));
      if (!payment) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.PAYMENT.NOT_FOUND } as ErrorResponse);
      }
      return res.status(HTTP_STATUS.OK).json(payment);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, (error as any).message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR, error } as ErrorResponse);
    }
  }

  static async processPayment(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, payment_method } = req.body;

    console.log('Procesando pago:', { product_id, quantity, payment_method });

    // Validate product_id
    if (!product_id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID 
      } as ErrorResponse);
    }

    // Validate quantity
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY 
      } as ErrorResponse);
    }

    // Validate payment_method
    if (!payment_method || !PAYMENT_METHODS.VALID_METHODS.includes(payment_method)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD 
      } as ErrorResponse);
    }

    try {
      const newPayment = await PaymentService.processPayment(
        Number(product_id), 
        Number(quantity), 
        payment_method
      );
      return res.status(HTTP_STATUS.CREATED).json(newPayment);
    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      // Handle specific errors
      if (error.message === ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY 
        } as ErrorResponse);
      }
      if (error.message === ERROR_MESSAGES.PAYMENT.INVALID_PRICE) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          message: ERROR_MESSAGES.PAYMENT.INVALID_PRICE 
        } as ErrorResponse);
      }
      if (error.message === ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ 
          message: ERROR_MESSAGES.PAYMENT.PRODUCT_NOT_FOUND,
          details: `Product with ID ${product_id} not found`
        } as ErrorResponse);
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        message: ERROR_MESSAGES.PAYMENT.PROCESS_ERROR 
      } as ErrorResponse);
    }
  }

  static async compensatePayment(req: Request, res: Response): Promise<Response> {
    const { paymentId } = req.params;

    try {
      const message = await PaymentService.compensatePayment(Number(paymentId));
      return res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS } as SuccessResponse);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR, (error as any).message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.PAYMENT.REVERT_ERROR, error } as ErrorResponse);
    }
  }
}

export default PaymentController;
