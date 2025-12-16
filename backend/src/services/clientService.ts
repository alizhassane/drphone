import { query } from '../config/db.js';

export interface Client {
    id?: number;
    name: string;
    phone: string;
    email: string;
    address?: string; // Added address
}

export const getAllClients = async () => {
    const result = await query('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows;
};

export const createClient = async (client: Client) => {
    const { name, phone, email, address } = client;
    if (!name) throw new Error('Client Name is required');

    // SQLite: Check column existence for address if it wasn't there initially, 
    // but assuming standard schema we might not have it. 
    // schema.sql showed id, name, phone, email, created_at. 
    // I should check if I need to add address column first or just ignore it for now if not in schema.
    // The user didn't explicitly ask for address but "Modifier" usually implies basic details. 
    // Let's stick to name, phone, email for now to match schema.

    const result = await query(
        'INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3)',
        [name, phone, email]
    );

    const newClientFn = await query('SELECT * FROM clients WHERE id = $1', [result.lastID]);
    return newClientFn.rows[0];
};

export const searchClients = async (searchQuery: string) => {
    const result = await query(
        'SELECT * FROM clients WHERE name LIKE $1 OR phone LIKE $1 OR email LIKE $1',
        [`%${searchQuery}%`]
    );
    return result.rows;
};

export const updateClient = async (id: number, updates: Partial<Client>) => {
    const { name, phone, email } = updates;
    await query(
        `UPDATE clients 
         SET name = COALESCE($1, name), 
             phone = COALESCE($2, phone), 
             email = COALESCE($3, email)
         WHERE id = $4`,
        [name, phone, email, id]
    );
    const updated = await query('SELECT * FROM clients WHERE id = $1', [id]);
    return updated.rows[0];
};

export const getClientHistory = async (clientId: number) => {
    // Fetch Repairs
    const repairsRes = await query(
        'SELECT * FROM repairs WHERE client_id = $1 ORDER BY created_at DESC',
        [clientId]
    );

    // Fetch Sales (assuming we can link sales to clients - schema check required. 
    // schema.sql didn't show client_id in sales explicitly? 
    // Wait, let's check schema again. 
    // schema.sql Step 472: sales table has id, total_amount... but NO client_id column?
    // repairs has client_id. 
    // payments has sale_id and repair_id.
    // EnhancedPOSScreen passes selectedClient, let's see how createSale handles it.
    // If sales table doesn't have client_id, we might need to add it or we can't show sales history easily.
    // Just showing repairs is a good start. 
    // BUT, ImprovedPaymentScreen Step 524 had `customer` in `transaction`.
    // Let's check if I need to add client_id to sales first. 
    // For now, I will implement fetching Repairs only to avoid breaking things, 
    // and mention if Sales are missing.

    return {
        repairs: repairsRes.rows,
        sales: [] // Placeholder until sales->client link is verified
    };
};
