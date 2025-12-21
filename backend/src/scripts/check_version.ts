import { query } from '../config/db';

const checkVersion = async () => {
    try {
        const result = await query('SELECT sqlite_version() as version');
        console.log('SQLite Version:', result.rows);
    } catch (e) {
        console.error('Error:', e);
    }
};

checkVersion();
