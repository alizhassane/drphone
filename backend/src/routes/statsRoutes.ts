import express from 'express';
import { getDashboardStatsHandler, getDailyStatsHandler } from '../controllers/statsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardStatsHandler);
router.get('/daily', getDailyStatsHandler);

export default router;
