import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES } from '../../config/constants/messages';

export const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { product_id, quantity, payment_method } = req.body;

  console.log('Validando pago:', { product_id, quantity, payment_method });

  // Basic presence checks
  if (!product_id || !quantity || !payment_method) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS 
    });
  }

  // Product ID validation
  if (isNaN(Number(product_id)) || Number(product_id) <= 0) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID 
    });
  }

  // Quantity validation
  if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY 
    });
  }

  // Payment method validation
  const validPaymentMethods = ['tarjeta', 'paypal', 'transferencia bancaria'];
  if (!validPaymentMethods.includes(payment_method)) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD 
    });
  }

  next();
};