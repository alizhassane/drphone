import { query } from '../config/db.js';

const migrate = async () => {
    try {
        console.log('Adding depot column to repairs table...');
        await query('ALTER TABLE repairs ADD COLUMN depot REAL DEFAULT 0');
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

migrate();
