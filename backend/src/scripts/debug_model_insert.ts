
import { getDb } from '../config/db.js';

(async () => {
    try {
        const db = await getDb();
        console.log('--- Debugging Model Insert ---');

        // 1. Check Schema
        const schema = await db.all("PRAGMA table_info(models)");
        console.log('Models Table Schema:', schema);

        const apiModels = await db.all("SELECT * FROM models LIMIT 5");
        console.log('First 5 models:', apiModels);

        const brandId = 'phone_apple';
        const name = 'Debug iPhone 16';

        console.log(`Attempting to insert model '${name}' for brand '${brandId}'...`);

        try {
            const result = await db.run('INSERT INTO models (brand_id, name) VALUES (?, ?)', [brandId, name]);
            console.log('Insert SUCCESS. ID:', result.lastID);

            // Cleanup
            await db.run('DELETE FROM models WHERE id = ?', [result.lastID]);
            console.log('Cleanup SUCCESS.');
        } catch (insertError) {
            console.error('Insert FAILED:', insertError);
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
})();
