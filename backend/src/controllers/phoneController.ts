
import type { Request, Response } from 'express';
import * as phoneService from '../services/phoneService.js';

export const getPhones = async (req: Request, res: Response) => {
    try {
        const filters = {
            status: req.query.status as string
        };
        const phones = await phoneService.getAllPhones(filters);
        res.json(phones);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch phones' });
    }
};

export const getPhone = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'ID required' });
        }
        const phone = await phoneService.getPhoneById(req.params.id);
        if (!phone) {
            return res.status(404).json({ error: 'Phone not found' });
        }
        res.json(phone);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch phone' });
    }
};

export const buyPhone = async (req: Request, res: Response) => {
    try {
        const { client_id, purchase_price, payment_method, ...phoneDetails } = req.body;

        // Basic validation
        if (!phoneDetails.imei || !phoneDetails.brand || !phoneDetails.model) {
            return res.status(400).json({ error: 'Missing required phone details' });
        }

        const purchase = {
            phone_id: '', // Set in service
            client_id: client_id || null, // Optional if buying from supplier without ID
            purchase_price: purchase_price,
            payment_method: payment_method || 'cash'
        };

        const newPhone = await phoneService.createPhonePurchase(phoneDetails, purchase);
        res.status(201).json(newPhone);
    } catch (error: any) {
        if (error.message === 'IMEI already exists') {
            return res.status(409).json({ error: 'IMEI already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to record purchase' });
    }
};

export const updatePhone = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'ID required' });
        }
        const updated = await phoneService.updatePhone(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update phone' });
    }
};
