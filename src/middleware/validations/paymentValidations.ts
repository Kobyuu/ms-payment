import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES } from '../../config/constants';

export const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { product_id, quantity, payment_method } = req.body;

  console.log('Validando pago:', { product_id, quantity, payment_method });

  if (!product_id || !quantity || !payment_method) {
    console.error('Error de validación: Campos obligatorios faltantes');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS });
  }

  if (isNaN(Number(product_id)) || Number(product_id) <= 0) {
    console.error('Error de validación: ID de producto inválido');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID });
  }

  if (quantity <= 0) {
    console.error('Error de validación: Cantidad inválida');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY });
  }

  const validPaymentMethods = ['tarjeta', 'paypal', 'transferencia bancaria'];
  if (!validPaymentMethods.includes(payment_method)) {
    console.error('Error de validación: Método de pago inválido');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD });
  }

  next();
};