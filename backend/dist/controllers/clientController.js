import * as clientService from '../services/clientService.js';
export const getClients = async (req, res) => {
    try {
        const query = req.query.search;
        if (query) {
            const clients = await clientService.searchClients(query);
            res.json(clients);
        }
        else {
            const clients = await clientService.getAllClients();
            res.json(clients);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};
export const createClient = async (req, res) => {
    try {
        const client = await clientService.createClient(req.body);
        res.status(201).json(client);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create client' });
    }
};
//# sourceMappingURL=clientController.js.map