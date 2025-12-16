import type { Request, Response } from 'express';
import { getDashboardStats, getDailyStats } from '../services/statsService.js';

export const getDashboardStatsHandler = async (req: Request, res: Response) => {
    try {
        const stats = await getDashboardStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

export const getDailyStatsHandler = async (req: Request, res: Response) => {
    try {
        const stats = await getDailyStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({ message: 'Error fetching daily stats' });
    }
};
