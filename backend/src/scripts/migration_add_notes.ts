
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database_new.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`Running migration on ${dbPath}`);

db.serialize(() => {
    db.run("ALTER TABLE repairs ADD COLUMN notes TEXT", (err) => {
        if (err) {
            console.log("Column 'notes' might already exist or error:", err.message);
        } else {
            console.log("Successfully added column 'notes' to repairs table.");
        }
    });
});

db.close();
