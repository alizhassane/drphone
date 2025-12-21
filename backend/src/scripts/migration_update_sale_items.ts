
import { getDb } from '../config/db.js';

async function migrate() {
    const db = await getDb();
    console.log('Migrating sale_items table...');

    try {
        const columns = await db.all("PRAGMA table_info(sale_items)");
        const columnNames = columns.map((c: any) => c.name);

        if (!columnNames.includes('repair_id')) {
            console.log('Adding repair_id column...');
            await db.run("ALTER TABLE sale_items ADD COLUMN repair_id INTEGER REFERENCES repairs(id)");
        } else {
            console.log('repair_id column already exists.');
        }

        if (!columnNames.includes('phone_id')) {
            console.log('Adding phone_id column...');
            await db.run("ALTER TABLE sale_items ADD COLUMN phone_id TEXT REFERENCES phones(id)");
        } else {
            console.log('phone_id column already exists.');
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
