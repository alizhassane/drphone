
import { query } from './backend/src/config/db';

const addSale = async () => {
    try {
        const date = '2025-12-11 14:30:00'; // Dec 11, 2025
        console.log(`Adding sale for date: ${date}`);

        // 1. Create Sale
        // Total 150, Tax 0 for simplicity or let's calculate?
        // Let's say item price 100.
        // Tax TPS (5%) = 5, TVQ (9.975%) = 9.98. Total ~115.
        // Let's just put flat numbers for clarity in report.
        // Price 200. Profit ~100.

        const result = await query(`
            INSERT INTO sales (total_amount, final_total, payment_method, status, created_at)
            VALUES ($1, $2, $3, $4, $5)
        `, [200, 200, 'Cash', 'Completed', date]);

        const saleId = result.lastID;
        console.log(`Sale created with ID: ${saleId}`);

        // 2. Create Sale Item
        // Product ID 1 (Assuming it exists, from previous checks we saw products)
        // Or manual item if no product.
        // Let's check products first? We saw product ID 12 in verification.
        // Let's use manual item to be safe, or just pick a product.
        // Reports use sale_items join products for purchase price.
        // If I want to verify profit, I should link to a product if possible, or use 0 purchase price (100% profit).

        // Let's try to link to the first product found.
        const productRes = await query('SELECT id FROM products LIMIT 1');
        const productId = productRes.rows[0]?.id;

        if (productId) {
            await query(`
                INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)
            `, [saleId, productId, 1, 200]);
            console.log(`Added item linked to Product ID ${productId}`);
        } else {
            await query(`
                INSERT INTO sale_items (sale_id, is_manual, manual_name, quantity, unit_price)
                VALUES ($1, 1, $2, $3, $4)
            `, [saleId, 'Manual Sale Item', 1, 200]);
            console.log('Added manual sale item (no product found)');
        }

        console.log('Done.');

    } catch (err) {
        console.error(err);
    }
};

addSale();
