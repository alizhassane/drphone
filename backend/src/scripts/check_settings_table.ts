
import { getDb } from '../config/db.js';

async function check() {
    try {
        const db = await getDb();
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'");
        console.log('Tables found:', tables);

        if (tables.length > 0) {
            const rows = await db.all("SELECT * FROM settings");
            console.log('Settings rows:', rows);
        }
    } catch (e) {
        console.error('Error checking DB:', e);
    }
}
check();
