import { Router } from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.get('/', paymentController.getPayments);

export default router;
