
import { getDb } from '../config/db.js';

(async () => {
    try {
        const db = await getDb();
        console.log('--- Checking Inventory Data ---');

        const categories = await db.all('SELECT * FROM device_categories');
        console.log(`Categories count: ${categories.length}`);
        console.log('Categories:', categories);

        const brands = await db.all('SELECT * FROM brands');
        console.log(`Brands count: ${brands.length}`);

        const models = await db.all('SELECT * FROM models');
        console.log(`Models count: ${models.length}`);

    } catch (error) {
        console.error('Error checking DB:', error);
    }
})();
