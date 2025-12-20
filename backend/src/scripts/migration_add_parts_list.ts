
import { query } from '../config/db.js';

async function migrate() {
    try {
        console.log("Adding parts_list column to repairs table...");
        await query("ALTER TABLE repairs ADD COLUMN parts_list TEXT");
        console.log("Migration successful.");
    } catch (error: any) {
        if (error.message && error.message.includes("duplicate column name")) {
            console.log("Column parts_list already exists.");
        } else {
            console.error("Migration failed:", error);
        }
    }
}

migrate();
