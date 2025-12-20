
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database_new.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`Checking tables for ${dbPath}`);

db.serialize(() => {
    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
        if (err) {
            console.error('Error listing tables:', err);
        } else {
            console.log('Tables:', rows.map((r: any) => r.name));
        }
    });

    db.all(`PRAGMA table_info(repairs)`, (err, rows) => {
        if (err) {
            console.error('Error checking repairs:', err);
        } else {
            console.log('repairs Columns:', rows);
        }
    });
});

db.close();
