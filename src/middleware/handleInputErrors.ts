import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ERROR_MESSAGES } from '../config/constants';

// Middleware para manejar errores de validación en las solicitudes
export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  // Si existen errores de validación, devolver un error 400 con los detalles
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Si no hay errores, continuar con la siguiente función
  next();
};

// Middleware para validar la entrada de datos para el pago
export const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { product_id, quantity, payment_method } = req.body;

  console.log('Validando pago:', { product_id, quantity, payment_method }); // Agrega este log

  // Validación de campos obligatorios
  if (!product_id || !quantity || !payment_method) {
    console.error('Error de validación: Campos obligatorios faltantes');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS });
  }

  // Validación de que product_id sea un número entero válido
  if (isNaN(Number(product_id)) || Number(product_id) <= 0) {
    console.error('Error de validación: ID de producto inválido');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PRODUCT_ID });
  }

  // Validación adicional para cantidad (debe ser mayor a 0)
  if (quantity <= 0) {
    console.error('Error de validación: Cantidad inválida');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY });
  }

  // Validación opcional para el método de pago (puedes ampliarlo según tus necesidades)
  const validPaymentMethods = ['tarjeta', 'paypal', 'transferencia bancaria']; // Ejemplo de métodos válidos
  if (!validPaymentMethods.includes(payment_method)) {
    console.error('Error de validación: Método de pago inválido');
    return res.status(400).json({ message: ERROR_MESSAGES.VALIDATION.INVALID_PAYMENT_METHOD });
  }

  // Si todo está bien, continuar con la siguiente función
  next();
};
