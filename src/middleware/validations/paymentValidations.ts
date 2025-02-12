import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES } from '../../config/constants/messages';

export const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { product_id, quantity, payment_method, price } = req.body;

  console.log('Validando pago:', { product_id, quantity, payment_method, price });

  if (!product_id || !quantity || !payment_method || price === undefined) {
    console.error(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS);
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS });
  }

  if (isNaN(Number(product_id)) || Number(product_id) <= 0) {
    console.error(ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID);
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID });
  }

  if (quantity <= 0) {
    console.error(ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY);
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY });
  }

  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    console.error(ERROR_MESSAGES.VALIDATION.INVALID_PRICE);
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PRICE });
  }

  const validPaymentMethods = ['tarjeta', 'paypal', 'transferencia bancaria'];
  if (!validPaymentMethods.includes(payment_method)) {
    console.error(ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD);
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD });
  }

  next();
};