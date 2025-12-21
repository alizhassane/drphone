
import express from 'express';
import * as settingsController from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', settingsController.getAllSettings);
router.post('/', settingsController.updateSettings);

export default router;
