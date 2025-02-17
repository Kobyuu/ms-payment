import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Middleware para validar datos de entrada
export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
  // Obtiene resultados de la validación
  const errors = validationResult(req);

  // Si hay errores, retorna respuesta con detalles
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Continúa con el siguiente middleware
  next();
};