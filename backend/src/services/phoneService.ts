
import { query } from '../config/db.js';
import { randomUUID } from 'crypto';

export interface Phone {
    id: string;
    imei: string;
    brand: string;
    model: string;
    storage: string;
    color: string;
    condition: 'A' | 'B' | 'C';
    battery_health: number;
    buying_price: number;
    selling_price: number;
    warranty_days: number;
    status: 'in_stock' | 'sold' | 'returned';
    source: 'customer' | 'supplier';
    created_at?: string;
}

export interface PhonePurchase {
    phone_id: string;
    client_id: number;
    purchase_price: number;
    payment_method: string;
}

export const getAllPhones = async (filters: any = {}) => {
    let sql = 'SELECT * FROM phones WHERE 1=1';
    const params: any[] = [];

    if (filters.status) {
        sql += ' AND status = $1';
        params.push(filters.status);
    }
    // Add more filters as needed (brand, imei check)

    sql += ' ORDER BY created_at DESC';
    const res = await query(sql, params);
    return res.rows;
};

export const getPhoneById = async (id: string) => {
    const res = await query('SELECT * FROM phones WHERE id = $1', [id]);
    return res.rows[0];
};

export const getPhoneByImei = async (imei: string) => {
    const res = await query('SELECT * FROM phones WHERE imei = $1', [imei]);
    return res.rows[0];
};

export const createPhonePurchase = async (phone: Omit<Phone, 'id' | 'status' | 'created_at'>, purchase: PhonePurchase) => {
    // 1. Create Phone Record
    const phoneId = randomUUID();

    // Check uniqueness (redundant if checking before call, but safe)
    const existing = await getPhoneByImei(phone.imei);
    if (existing) throw new Error('IMEI already exists');

    await query(
        `INSERT INTO phones (id, imei, brand, model, storage, color, condition, battery_health, buying_price, selling_price, warranty_days, status, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'in_stock', $12)`,
        [phoneId, phone.imei, phone.brand, phone.model, phone.storage, phone.color, phone.condition, phone.battery_health, phone.buying_price, phone.selling_price, phone.warranty_days, phone.source]
    );

    // 2. Record Purchase Transaction
    await query(
        `INSERT INTO phone_purchases (phone_id, client_id, purchase_price, payment_method)
         VALUES ($1, $2, $3, $4)`,
        [phoneId, purchase.client_id, purchase.purchase_price, purchase.payment_method]
    );

    // TODO: Ideally we should link this to Expenses table if it exists

    return getPhoneById(phoneId);
};

export const updatePhone = async (id: string, updates: Partial<Phone>) => {
    const allowed = ['brand', 'model', 'storage', 'color', 'condition', 'battery_health', 'selling_price', 'status'];
    const fields = Object.keys(updates).filter(key => allowed.includes(key));

    if (fields.length === 0) return getPhoneById(id);

    const setClause = fields.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = fields.map(key => (updates as any)[key]);

    await query(`UPDATE phones SET ${setClause} WHERE id = $1`, [id, ...values]);
    return getPhoneById(id);
};
