import { Router } from 'express';
import * as repairController from '../controllers/repairController.js';

const router = Router();

router.get('/', repairController.getRepairs);
router.post('/', repairController.createRepair);
router.put('/:id/status', repairController.updateStatus);
router.put('/:id', repairController.updateDetails);
router.delete('/:id', repairController.deleteRepair);

export default router;
