import { query } from '../config/db.js';

const migrate = async () => {
    console.log('Running migration: Add client_id to sales table');
    try {
        await query('ALTER TABLE sales ADD COLUMN client_id INTEGER REFERENCES clients(id)');
        console.log('Success: Added client_id to sales table');
    } catch (e) {
        console.log('Migration note (usually safe if column exists):', e);
    }
};

migrate();
