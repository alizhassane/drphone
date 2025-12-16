
import { getDb } from './backend/src/config/db';

const rollback = async () => {
    try {
        console.log('Opening DB...');
        const db = await getDb();

        console.log('Removing sub_category and quality columns from products table...');

        // SQLite doesn't support DROP COLUMN directly in older versions
        // We need to recreate the table without those columns
        console.log('Creating backup of products table...');
        await db.run('CREATE TABLE products_backup AS SELECT id, name, sku, price, stock_quantity, category, created_at FROM products');

        console.log('Dropping original products table...');
        await db.run('DROP TABLE products');

        console.log('Renaming backup to products...');
        await db.run('ALTER TABLE products_backup RENAME TO products');

        console.log('Rollback complete.');

    } catch (err) {
        console.error('Error executing rollback:', err);
    }
};

rollback();
