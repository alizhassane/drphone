
import { Router } from 'express';
import * as phoneController from '../controllers/phoneController.js';

const router = Router();

router.get('/', phoneController.getPhones);
router.get('/:id', phoneController.getPhone);
router.post('/buy', phoneController.buyPhone);
router.put('/:id', phoneController.updatePhone);

export default router;
