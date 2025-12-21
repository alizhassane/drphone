
import { getDb } from '../config/db.js';

async function migrate() {
    const db = await getDb();

    console.log('Migrating: settings table...');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `);

    // Pre-populate default empty values if not exists
    const defaults = {
        'sms_enabled': 'false',
        'sms_provider': '',
        'sms_api_key': '',
        'sms_number': '',
        'sms_tmpl_received': 'true',
        'sms_tmpl_done': 'true'
    };

    for (const [key, value] of Object.entries(defaults)) {
        // IGNORE to keep existing values if run multiple times
        await db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }

    console.log('Migration complete: settings table created.');
}

migrate().catch(console.error);
