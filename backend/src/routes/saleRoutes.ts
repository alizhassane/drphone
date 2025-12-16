import { Router } from 'express';
import * as saleController from '../controllers/saleController.js';

const router = Router();

router.post('/', saleController.createSale);
router.get('/', saleController.getSales);

export default router;
