import { query } from '../config/db.js';

async function checkSchema() {
    try {
        const res = await query("PRAGMA table_info(products)");
        console.log("Products Table Schema:", res.rows);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkSchema();
