import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Routes
import clientRoutes from './routes/clientRoutes.js';
import productRoutes from './routes/productRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
// Basic Route
app.get('/', (req, res) => {
    res.send('Dr.Phone Manager API is running');
});
// Database Connection Test (Placeholder)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
app.get('/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map