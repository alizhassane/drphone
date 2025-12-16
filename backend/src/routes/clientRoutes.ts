import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';

const router = Router();

router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.get('/:id/history', clientController.getClientHistory);

export default router;
