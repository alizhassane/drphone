import express from 'express';
import * as userService from '../services/userService';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.json(user);
    } catch (e: any) {
        console.error('Create user error:', e);
        res.status(400).json({ error: e.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const user = { ...req.body, id: req.params.id };
        const updated = await userService.updateUser(user);
        res.json(updated);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userService.validateUser(username, password);
        if (user) {
            res.json(user);
        } else {
            // 401 Unauthorized
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
