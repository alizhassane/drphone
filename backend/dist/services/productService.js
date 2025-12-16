import { query } from '../config/db.js';
export const getAllProducts = async () => {
    const result = await query('SELECT * FROM products ORDER BY name ASC');
    return result.rows;
};
export const createProduct = async (product) => {
    const { name, sku, price, stock_quantity, category } = product;
    const result = await query('INSERT INTO products (name, sku, price, stock_quantity, category) VALUES ($1, $2, $3, $4, $5)', [name, sku, price, stock_quantity, category]);
    // Fetch inserted
    const newProduct = await query('SELECT * FROM products WHERE id = $1', [result.lastID]);
    return newProduct.rows[0];
};
export const updateStock = async (id, quantityChange) => {
    await query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2', [quantityChange, id]);
    // Fetch updated
    const updatedProduct = await query('SELECT * FROM products WHERE id = $1', [id]);
    return updatedProduct.rows[0];
};
export const searchProducts = async (searchQuery) => {
    const result = await query('SELECT * FROM products WHERE name LIKE $1 OR sku LIKE $1 OR category LIKE $1', [`%${searchQuery}%`]);
    return result.rows;
};
//# sourceMappingURL=productService.js.map