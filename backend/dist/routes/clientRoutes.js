import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
const router = Router();
router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
export default router;
//# sourceMappingURL=clientRoutes.js.map