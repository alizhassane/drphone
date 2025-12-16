import { query } from '../config/db.js';
export const getAllClients = async () => {
    const result = await query('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows;
};
export const createClient = async (client) => {
    const { name, phone, email } = client;
    const result = await query('INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3)', [name, phone, email]); // Wrapper replaces $1 with ?
    // SQLite: Fetch the created row manually
    const newClientFn = await query('SELECT * FROM clients WHERE id = $1', [result.lastID]);
    return newClientFn.rows[0];
};
export const searchClients = async (searchQuery) => {
    // SQLite uses LIKE (case-insensitive by default in some configurations for ASCII, but usually needs LOWER() for unicode)
    // ILIKE is Postgres specific.
    const result = await query('SELECT * FROM clients WHERE name LIKE $1 OR phone LIKE $1 OR email LIKE $1', [`%${searchQuery}%`]);
    return result.rows;
};
//# sourceMappingURL=clientService.js.map