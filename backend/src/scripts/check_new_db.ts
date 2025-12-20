
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database_new.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`Checking schema for ${dbPath}`);

db.all(`PRAGMA table_info(repairs)`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Columns:', rows.map((r: any) => r.name));
    }
    db.close();
});
