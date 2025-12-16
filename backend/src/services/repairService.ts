import { query } from '../config/db.js';

export interface Repair {
    id?: number;
    client_id: number;
    device_details: string;
    issue_description: string;
    status: string;
    cost_estimate: number;
    parts?: number[]; // IDs of parts used
}

export const getAllRepairs = async () => {
    const repairsRes = await query(`
    SELECT r.*, c.name as client_name 
    FROM repairs r 
    JOIN clients c ON r.client_id = c.id 
    ORDER BY r.created_at DESC
  `);
    const repairs = repairsRes.rows;

    if (repairs.length === 0) return [];

    // Fetch parts for these repairs
    const repairIds = repairs.map((r: any) => r.id);
    const placeholders = repairIds.map(() => '?').join(',');

    const partsRes = await query(`
        SELECT rp.repair_id, p.name 
        FROM repair_parts rp
        JOIN products p ON rp.product_id = p.id
        WHERE rp.repair_id IN (${placeholders})
    `, repairIds);

    const partsByRepair: Record<number, string[]> = {};

    partsRes.rows.forEach((row: any) => {
        if (!partsByRepair[row.repair_id]) {
            partsByRepair[row.repair_id] = [];
        }
        partsByRepair[row.repair_id].push(row.name);
    });

    return repairs.map((r: any) => ({
        ...r,
        piecesUtilisees: partsByRepair[r.id] || []
    }));
};

export const createRepair = async (repair: any) => {
    const { client_id, device_details, issue_description, cost_estimate, status, statut, parts, warranty } = repair;
    const finalStatus = status || statut || 'reçue';
    const finalWarranty = warranty !== undefined ? warranty : 90;

    const res = await query(
        `INSERT INTO repairs (client_id, device_details, issue_description, status, cost_estimate, warranty) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [client_id, device_details, issue_description, finalStatus, cost_estimate, finalWarranty]
    );
    const newRepair = res.rows[0];

    if (parts && Array.isArray(parts) && parts.length > 0) {
        for (const partId of parts) {
            await query(
                `INSERT INTO repair_parts (repair_id, product_id) VALUES ($1, $2)`,
                [newRepair.id, partId]
            );
        }
    }

    return newRepair;
};

// Helper to determine if a status implies parts have been consumed
const isConsumedState = (status: string) => {
    return ['réparée', 'payée_collectée'].includes(status);
};

export const updateRepairStatus = async (id: number, status: string) => {
    const currentRepairRes = await query('SELECT status FROM repairs WHERE id = $1', [id]);
    const currentStatus = currentRepairRes.rows[0]?.status;

    await query(
        'UPDATE repairs SET status = $1 WHERE id = $2',
        [status, id]
    );

    // Decrement stock if moving FROM a non-consumed state TO a consumed state
    // consumed states: 'réparée', 'payée_collectée'
    if (isConsumedState(status) && !isConsumedState(currentStatus)) {
        const partsRes = await query('SELECT product_id FROM repair_parts WHERE repair_id = $1', [id]);
        const parts = partsRes.rows;

        for (const part of parts) {
            await query(
                'UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = $1',
                [part.product_id]
            );
        }
    }

    const updatedRepair = await query('SELECT * FROM repairs WHERE id = $1', [id]);
    return updatedRepair.rows[0];
};

export const updateRepair = async (id: number, updates: any) => {
    const { issue_description, cost_estimate, depot, status, warranty } = updates;

    // 1. Check for status change logic (stock decrement)
    if (status) {
        const currentRepairRes = await query('SELECT status FROM repairs WHERE id = $1', [id]);
        const currentStatus = currentRepairRes.rows[0]?.status;

        if (isConsumedState(status) && !isConsumedState(currentStatus)) {
            const partsRes = await query('SELECT product_id FROM repair_parts WHERE repair_id = $1', [id]);
            const parts = partsRes.rows;
            for (const part of parts) {
                await query(
                    'UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = $1',
                    [part.product_id]
                );
            }
        }
    }

    // 2. Perform generic update
    await query(
        `UPDATE repairs 
         SET issue_description = COALESCE($1, issue_description), 
             cost_estimate = COALESCE($2, cost_estimate), 
             status = COALESCE($3, status),
             depot = COALESCE($4, depot),
             warranty = COALESCE($5, warranty)
         WHERE id = $6`,
        [issue_description, cost_estimate, status, depot, warranty, id]
    );

    const updatedRepair = await query('SELECT * FROM repairs WHERE id = $1', [id]);
    return updatedRepair.rows[0];
};
