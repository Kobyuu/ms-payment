// filepath: microservicios/ms-payment/src/routes/index.ts
import { Router } from 'express';
import paymentRoutes from './paymentRoutes';

const router = Router();

router.use('/payments', paymentRoutes);

export default router;