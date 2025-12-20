
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const addColumn = (colName, colType) => {
    return new Promise((resolve) => {
        db.run(`ALTER TABLE repairs ADD COLUMN ${colName} ${colType}`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column ${colName} already exists`);
                } else {
                    console.error(`Failed to add ${colName}:`, err);
                }
            } else {
                console.log(`Added column ${colName}`);
            }
            resolve(true);
        });
    });
};

const migrate = async () => {
    console.log(`Running migration on ${dbPath}...`);
    await addColumn('parts_list', 'TEXT');
    await addColumn('warranty', 'INTEGER');
    await addColumn('depot', 'REAL');
    console.log('Migration completed');
    db.close();
};

migrate();
