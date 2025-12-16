import fs from 'fs';
import path from 'path';
import { getDb } from '../config/db.js';
const initDb = async () => {
    try {
        const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Running database schema...');
        const db = await getDb();
        await db.exec(schemaSql);
        console.log('Database initialized successfully.');
        // Don't exit process immediately if used in dev, but here it's a script
        process.exit(0);
    }
    catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};
initDb();
//# sourceMappingURL=init.js.map