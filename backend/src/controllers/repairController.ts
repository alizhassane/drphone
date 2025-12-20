import type { Request, Response } from 'express';
import * as repairService from '../services/repairService.js';
import fs from 'fs';
import path from 'path';

export const getRepairs = async (req: Request, res: Response) => {
    try {
        const repairs = await repairService.getAllRepairs();
        res.json(repairs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch repairs' });
    }
};

export const createRepair = async (req: Request, res: Response) => {
    try {
        const logPath = path.join(process.cwd(), 'controller_debug.log');
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Create Request Body: ${JSON.stringify(req.body)}\n`);

        const repair = await repairService.createRepair(req.body);
        res.status(201).json(repair);
    } catch (err: any) {
        console.error(err);
        try {
            const logPath = path.join(process.cwd(), 'controller_debug.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Controller Error: ${err.message}\nStack: ${err.stack}\n`);
        } catch (e) { console.error('Failed log', e); }

        res.status(500).json({ error: 'Failed to create repair', details: err.message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const repair = await repairService.updateRepairStatus(Number(id), status);
        res.json(repair);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update repair status' });
    }
};

export const updateDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // issue_description, cost_estimate, depot, status
        const updates = req.body;
        const repair = await repairService.updateRepair(Number(id), updates);
        res.json(repair);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update repair details' });
    }
};
export const deleteRepair = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await repairService.deleteRepair(Number(id));
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete repair' });
    }
};
