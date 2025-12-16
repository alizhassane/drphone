
import { getDb } from './backend/src/config/db';

const migrate = async () => {
    try {
        console.log('Opening DB...');
        const db = await getDb();

        console.log('Adding sub_category and quality columns to products table...');

        // SQLite doesn't support adding multiple columns in one statement easily, so we thrive one by one
        // We use try-catch to ignore if they already exist (idempotency)
        try {
            await db.run('ALTER TABLE products ADD COLUMN sub_category TEXT');
            console.log('Added sub_category column.');
        } catch (e: any) {
            if (e.message.includes('duplicate column')) console.log('sub_category column already exists.');
            else throw e;
        }

        try {
            await db.run('ALTER TABLE products ADD COLUMN quality TEXT');
            console.log('Added quality column.');
        } catch (e: any) {
            if (e.message.includes('duplicate column')) console.log('quality column already exists.');
            else throw e;
        }

        console.log('Migration complete.');

    } catch (err) {
        console.error('Error executing migration:', err);
    }
};

migrate();
