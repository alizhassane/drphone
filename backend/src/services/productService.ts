import { query } from '../config/db.js';

export interface Product {
    id?: number;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    category: string;
    min_stock_alert?: number;
    purchase_price?: number;
    section?: 'Pièces' | 'Accessoires';
    quality?: string;
}

export const getAllProducts = async () => {
    const result = await query('SELECT * FROM products ORDER BY name ASC');
    return result.rows;
};

export const getProductBySku = async (sku: string) => {
    const result = await query('SELECT * FROM products WHERE sku = $1', [sku]);
    return result.rows[0];
};

export const createProduct = async (product: Product) => {
    const { name, sku, price, stock_quantity, category, min_stock_alert, purchase_price, section, quality } = product;

    // Check if product exists
    const existing = await getProductBySku(sku);
    if (existing) {
        // Merge: Update stock
        await query(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [stock_quantity, existing.id]
        );
        const updated = await query('SELECT * FROM products WHERE id = $1', [existing.id]);
        return { ...updated.rows[0], _merged: true }; // Flag to indicate merge
    }

    const result = await query(
        'INSERT INTO products (name, sku, price, stock_quantity, category, min_stock_alert, purchase_price, section, quality) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [name, sku, price, stock_quantity, category, min_stock_alert || 5, purchase_price || 0, section || 'Accessoires', quality || null]
    );

    // Fetch inserted
    let newProduct = await query('SELECT * FROM products WHERE id = $1', [result.lastID]);
    if (!newProduct.rows[0]) {
        newProduct = await query('SELECT * FROM products WHERE sku = $1', [sku]);
    }
    return newProduct.rows[0];
};

export const updateStock = async (id: number, quantityChange: number) => {
    await query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [quantityChange, id]
    );
    // Fetch updated
    const updatedProduct = await query('SELECT * FROM products WHERE id = $1', [id]);
    return updatedProduct.rows[0];
};

export const searchProducts = async (searchQuery: string) => {
    const result = await query(
        'SELECT * FROM products WHERE name LIKE $1 OR sku LIKE $1 OR category LIKE $1',
        [`%${searchQuery}%`]
    );
    return result.rows;
};

export const updateProduct = async (id: number, product: Partial<Product>) => {
    const { name, sku, price, stock_quantity, category, min_stock_alert, purchase_price, section, quality } = product;

    await query(
        `UPDATE products 
         SET name = $1, sku = $2, price = $3, stock_quantity = $4, category = $5, min_stock_alert = $6, purchase_price = $7, section = $8, quality = $9
         WHERE id = $10`,
        [name, sku, price, stock_quantity, category, min_stock_alert || 5, purchase_price || 0, section || 'Accessoires', quality || null, id]
    );

    const updated = await query('SELECT * FROM products WHERE id = $1', [id]);
    return updated.rows[0];
};

export const deleteProduct = async (id: number) => {
    await query('DELETE FROM products WHERE id = $1', [id]);
    return true;
};
