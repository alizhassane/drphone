
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const migrate = () => {
    console.log(`Running migration on ${dbPath}...`);
    db.run(`ALTER TABLE repairs ADD COLUMN repair_type TEXT`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column already exists');
            } else {
                console.error('Migration failed:', err);
            }
        } else {
            console.log('Migration successful');
        }
        db.close();
    });
};

migrate();
