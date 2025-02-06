import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';
import { ErrorResponse, SuccessResponse } from '../types/types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';
import { HTTP_STATUS } from '../config/constants/httpStatus';

class PaymentController {
  
  static async compensatePayment(req: Request, res: Response): Promise<Response> {
    const { paymentId } = req.params;

    try {
      const message = await PaymentService.compensatePayment(Number(paymentId));
      return res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.PAYMENT.REVERT_SUCCESS } as SuccessResponse);
    } catch (error) {
      console.error(ERROR_MESSAGES.PAYMENT.REVERT_ERROR, error.message);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.PAYMENT.REVERT_ERROR, error } as ErrorResponse);
    }
  }
}

export default PaymentController;