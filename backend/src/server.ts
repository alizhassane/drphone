import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// import { Pool } from 'pg'; // Removed for SQLite

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    try {
        const logPath = path.join(process.cwd(), 'server_requests.log');
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${req.method} ${req.url} Body: ${JSON.stringify(req.body)}\n`);
    } catch (e) {
        console.error('Logging failed', e);
    }
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body);
    next();
});

// Routes
import clientRoutes from './routes/clientRoutes.js';
import productRoutes from './routes/productRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import phoneRoutes from './routes/phoneRoutes.js';

app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Dr.Phone Manager API is running');
});

// Database Connection Test (Placeholder)
// Database Connection Test (Placeholder)
import { getDb } from './config/db.js';

app.get('/db-test', async (req, res) => {
    try {
        const db = await getDb();
        const result = await db.get('SELECT date("now") as now');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
