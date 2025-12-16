import type { Request, Response } from 'express';
import * as clientService from '../services/clientService.js';

export const getClients = async (req: Request, res: Response) => {
    try {
        const query = req.query.search as string;
        if (query) {
            const clients = await clientService.searchClients(query);
            res.json(clients);
        } else {
            const clients = await clientService.getAllClients();
            res.json(clients);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

export const createClient = async (req: Request, res: Response) => {
    try {
        const newClient = await clientService.createClient(req.body);
        res.status(201).json(newClient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create client' });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedClient = await clientService.updateClient(id, req.body);
        res.json(updatedClient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update client' });
    }
};

export const getClientHistory = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const history = await clientService.getClientHistory(id);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch client history' });
    }
};
