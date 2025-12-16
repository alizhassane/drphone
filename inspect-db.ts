
import { getDb } from './backend/src/config/db';

const inspect = async () => {
    try {
        console.log('Opening DB...');
        const db = await getDb();

        console.log('\n--- CLIENTS ---');
        const clients = await db.all('SELECT * FROM clients');
        console.table(clients);

        console.log('\n--- PRODUCTS ---');
        const products = await db.all('SELECT * FROM products');
        console.table(products);

        console.log('\n--- REPAIRS ---');
        const repairs = await db.all('SELECT * FROM repairs');
        console.table(repairs);

    } catch (err) {
        console.error('Error inspecting DB:', err);
    }
};

inspect();
