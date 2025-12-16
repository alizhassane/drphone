import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
// Enable verbose logging in dev
const verbose = process.env.NODE_ENV !== 'production' ? console.log : null;
// Helper to open the db connection
// In a real app we might want to cache this connection or use a pool
// But for SQLite simple usage, opening per request or caching one global instance is fine.
// We'll cache a global promise.
let dbPromise = null;
export const getDb = async () => {
    if (dbPromise)
        return dbPromise;
    dbPromise = open({
        filename: process.env.DATABASE_URL || path.join(process.cwd(), 'database.sqlite'),
        driver: sqlite3.Database
    });
    return dbPromise;
};
// Wrapper to mimic pg pool.query behavior for easy refactoring
export const query = async (text, params = []) => {
    const db = await getDb();
    // SQLite uses ? or $1, $2 etc. 
    // The `sqlite` wrapper supports `:name`, `@name`, `$name`. 
    // However, existing PG queries use `$1`, `$2`. 
    // `sqlite3` driver typically binds `?` for positional args.
    // If we pass an array, `sqlite` maps them to `?` placeholders potentially. 
    // BUT the SQL text contains `$1`. We might need to replace `$n` with `?`.
    // Let's replace $1, $2 with ? using regex.
    // NOTE: This assumes params are passed in correct order matching $1, $2...
    const convertedText = text.replace(/\$\d+/g, '?');
    // Check if it's a SELECT (returns rows) or INSERT/UPDATE (returns result info)
    const isSelect = /^\s*SELECT/i.test(convertedText) || /RETURNING/i.test(convertedText);
    try {
        if (isSelect) {
            const rows = await db.all(convertedText, params);
            return { rows, rowCount: rows.length };
        }
        else {
            const result = await db.run(convertedText, params);
            // Return structure mimicking pg result but adding lastID
            return {
                rows: [],
                rowCount: result.changes,
                lastID: result.lastID
            };
        }
    }
    catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};
// Default export for backward compatibility if we used `import pool from ...`
export default {
    query,
    connect: async () => {
        // For SQLite, transactions are just BEGIN/COMMIT on the same connection
        // We can return a "client" object that just points to our query wrapper 
        // effectively treating strictly serial transactions (SQLite default)
        return {
            query,
            release: () => { }
        };
    }
};
//# sourceMappingURL=db.js.map