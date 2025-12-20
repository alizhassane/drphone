
import { query } from '../config/db.js';

async function checkRepairsSchema() {
    try {
        const res = await query("SELECT sql FROM sqlite_master WHERE name='repairs'");
        console.log("Repairs Table SQL:", res.rows[0]?.sql);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkRepairsSchema();
