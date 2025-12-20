import pool from '../config/db.js'; // Uses default export with connect/query mock

export interface SaleItem {
    product_id?: number | null;
    phone_id?: string | null;
    quantity: number;
    unit_price: number;
    is_manual: boolean;
    manual_name?: string;
}

export interface Sale {
    total_amount: number;
    tax_tps: number;
    tax_tvq: number;
    final_total: number;
    payment_method: string;
    items: SaleItem[];
}

export const createSale = async (sale: Sale) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { total_amount, tax_tps, tax_tvq, final_total, payment_method, items } = sale;

        // 1. Create Sale Record
        // Remove RETURNING, use lastID
        const saleInsert = await client.query(
            'INSERT INTO sales (total_amount, tax_tps, tax_tvq, final_total, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [total_amount, tax_tps, tax_tvq, final_total, payment_method, 'Completed']
        );
        const saleId = saleInsert.lastID;
        // Need to construct the object or fetch it? Frontend might demand the object.
        // Let's fetch it to be safe and consistent.
        const saleFetch = await client.query('SELECT * FROM sales WHERE id = $1', [saleId]);
        const createdSale = saleFetch.rows[0];

        // 2. Process Items
        for (const item of items) {
            await client.query(
                'INSERT INTO sale_items (sale_id, product_id, phone_id, quantity, unit_price, is_manual, manual_name) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [saleId, item.product_id, item.phone_id, item.quantity, item.unit_price, item.is_manual ? 1 : 0, item.manual_name]
            );

            // Decrement Inventory if product
            if (!item.is_manual && item.product_id) {
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            // Update Phone Status if phone
            if (item.phone_id) {
                await client.query(
                    "UPDATE phones SET status = 'sold' WHERE id = $1",
                    [item.phone_id]
                );
            }
        }

        // 3. Record Payment
        await client.query(
            'INSERT INTO payments (sale_id, amount, method) VALUES ($1, $2, $3)',
            [saleId, final_total, payment_method]
        );

        await client.query('COMMIT');
        return createdSale;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const getAllSales = async () => {
    // JS-side aggregation to avoid SQLite JSON complexity and dialect issues
    const salesRes = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    const sales = salesRes.rows;

    if (sales.length === 0) return [];

    const saleIds = sales.map(s => s.id);
    // Simple way to get all items? 
    // SQLite doesn't support ANY($1). We have to manual query or loop (bad N+1) or filtered join.
    // Let's just fetch ALL sale items for these sales? Or just fetch ALL items if not too many?
    // Or simpler: `SELECT si.*, p.name as product_name FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE sale_id IN (${saleIds.join(',')})`
    // BEWARE: SQL Injection if we inline IDs. But IDs are from our DB (ints).
    // Safer: bind params. `IN (?, ?, ...)`

    // Actually, let's just do a big JOIN and reduce in JS. It's standard `client.query` so uses `?` mapping.
    // If I use `pool.query`, checking mapped `?` count:

    const query = `
        SELECT s.id as sale_id, s.*, 
               si.product_id, si.phone_id, si.quantity, si.unit_price, si.is_manual, si.manual_name,
               p.name as product_name, ph.model as phone_model, ph.brand as phone_brand, ph.imei as phone_imei
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        LEFT JOIN products p ON si.product_id = p.id
        LEFT JOIN phones ph ON si.phone_id = ph.id
        ORDER BY s.created_at DESC
    `;

    const result = await pool.query(query);
    const rows = result.rows;

    // Map to structure
    const salesMap = new Map();

    for (const row of rows) {
        if (!salesMap.has(row.sale_id)) {
            salesMap.set(row.sale_id, {
                id: row.sale_id,
                total_amount: row.total_amount,
                tax_tps: row.tax_tps,
                tax_tvq: row.tax_tvq,
                final_total: row.final_total,
                payment_method: row.payment_method,
                status: row.status,
                created_at: row.created_at,
                items: []
            });
        }

        if (row.product_id || row.is_manual) { // If there is an item
            salesMap.get(row.sale_id).items.push({
                product_id: row.product_id,
                quantity: row.quantity,
                unit_price: row.unit_price,
                is_manual: !!row.is_manual, // Cast back to boolean
                manual_name: row.manual_name,
                product_name: row.product_name
            });
        }
    }

    return Array.from(salesMap.values());
};
