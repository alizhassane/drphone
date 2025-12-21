
import type { Request, Response } from 'express';
import * as settingsService from '../services/settingsService.js';

export const getAllSettings = async (req: Request, res: Response) => {
    try {
        const settings = await settingsService.getSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const newSettings = req.body;
        const updated = await settingsService.updateSettings(newSettings);
        res.json(updated);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
