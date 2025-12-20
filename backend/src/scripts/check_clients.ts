
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check database_new.sqlite as verified earlier
const dbPath = path.join(__dirname, '../../database_new.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check clients table schema
    db.all(`PRAGMA table_info(clients)`, (err, rows) => {
        if (err) console.error('Error checking clients schema:', err);
        else console.log('clients Schema:', rows);
    });

    // Check sample data
    db.all(`SELECT id, name FROM clients LIMIT 5`, (err, rows) => {
        if (err) console.error('Error fetching clients:', err);
        else console.log('clients Sample:', rows);
    });
});

db.close();
