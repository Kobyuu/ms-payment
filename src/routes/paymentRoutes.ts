// filepath: microservicios/ms-payment/src/routes/paymentRoutes.ts
import { Router } from 'express';
import PaymentController from '../controllers/paymentController';

const router = Router();

router.post('/', PaymentController.processPayment);
// Agrega más rutas según sea necesario

export default router;