import { Router } from 'express';
import { handleInputErrors, validatePayment } from './middleware/handleInputErrors';
import PaymentController from './controllers/paymentController';

const router = Router();

// Ruta para obtener todos los pagos
router.get('/payments', handleInputErrors, PaymentController.getPayments);

// Ruta para obtener un pago específico por ID
router.get('/payments/:id', handleInputErrors, PaymentController.getPaymentById);

// Ruta para procesar un nuevo pago
router.post('/payments', validatePayment, handleInputErrors, PaymentController.processPayment);

// Ruta para revertir un pago
router.delete('/payments/:paymentId', handleInputErrors, PaymentController.compensatePayment);

export default router;