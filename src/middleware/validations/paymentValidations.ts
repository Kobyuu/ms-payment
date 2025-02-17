import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, PAYMENT_METHODS } from '../../config/constants';

// Middleware para validar datos de pago
export const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { product_id, quantity, payment_method } = req.body;

  // Log para depuración
  console.log('Validando pago:', { product_id, quantity, payment_method });

  // Verifica presencia de campos requeridos
  if (!product_id || !quantity || !payment_method) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS 
    });
  }

  // Valida ID del producto (debe ser número positivo)
  if (isNaN(Number(product_id)) || Number(product_id) <= 0) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID 
    });
  }

  // Valida cantidad (debe ser número positivo)
  if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY 
    });
  }

  // Valida método de pago (debe estar en lista permitida)
  if (!PAYMENT_METHODS.VALID_METHODS.includes(payment_method)) {
    return res.status(400).json({ 
      message: ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD 
    });
  }

  // Si todas las validaciones pasan, continúa
  next();
};