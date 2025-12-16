import { query } from '../config/db.js';

async function checkSchema() {
    try {
        const res = await query("SELECT sql FROM sqlite_master WHERE name='products'");
        console.log("Create Table SQL:", res.rows[0]?.sql);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkSchema();
