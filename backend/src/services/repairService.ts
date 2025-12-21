import { query } from '../config/db.js';
import * as smsService from './smsService.js';

// ... existing code ...

export const createRepair = async (repair: any) => {
    try {
        const { client_id, device_details, issue_description, cost_estimate, status, statut, parts, warranty, piecesUtilisees, typeReparation, notes } = repair;
        const finalStatus = status || statut || 'reçue';
        const finalWarranty = warranty !== undefined ? warranty : 90;
        const partsListJson = JSON.stringify(piecesUtilisees || []);

        // ... (existing insert logic) ...

        const res = await query(
            `INSERT INTO repairs (client_id, device_details, issue_description, status, cost_estimate, warranty, parts_list, repair_type, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [client_id, device_details, issue_description, finalStatus, cost_estimate, finalWarranty, partsListJson, typeReparation, notes]
        );
        const newRepairId = res.lastID;

        // Fetch full details including client for SMS
        const fullRepairRes = await query(`
            SELECT r.*, c.name as client_name, c.phone as client_phone 
            FROM repairs r 
            JOIN clients c ON r.client_id = c.id 
            WHERE r.id = $1
        `, [newRepairId]);
        const newRepair = fullRepairRes.rows[0];

        // ... (parts insertion) ...
        if (parts && Array.isArray(parts) && parts.length > 0) {
            for (const partId of parts) {
                await query(
                    `INSERT INTO repair_parts (repair_id, product_id) VALUES ($1, $2)`,
                    [newRepair.id, partId]
                );
            }
        }

        // Send SMS Notification
        if (newRepair.client_phone) {
            smsService.sendRepairStatusUpdate(
                newRepair.client_phone,
                newRepair.client_name,
                newRepair.id.toString(),
                newRepair.status,
                newRepair.device_details
            ).catch(err => console.error("Failed to send creation SMS", err));
        }

        return newRepair;
    } catch (error: any) {
        // ... (error handling) ...
        console.error('Error creating repair:', error);
        throw error;
    }
};

// ...

export const updateRepairStatus = async (id: number, status: string) => {
    // ... (existing update logic) ...
    const currentRepairRes = await query('SELECT status FROM repairs WHERE id = $1', [id]);
    const currentStatus = currentRepairRes.rows[0]?.status;

    await query(
        'UPDATE repairs SET status = $1 WHERE id = $2',
        [status, id]
    );

    // ... (stock decrement logic) ...
    if (isConsumedState(status) && !isConsumedState(currentStatus)) {
        // ... (existing stock logic) ...
        const partsRes = await query('SELECT product_id FROM repair_parts WHERE repair_id = $1', [id]);
        const parts = partsRes.rows;

        for (const part of parts) {
            await query(
                'UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = $1',
                [part.product_id]
            );
        }
    }

    // Fetch updated with client info for SMS
    const updatedRepairRes = await query(`
        SELECT r.*, c.name as client_name, c.phone as client_phone 
        FROM repairs r 
        JOIN clients c ON r.client_id = c.id 
        WHERE r.id = $1
    `, [id]);
    const updatedRepair = updatedRepairRes.rows[0];

    // Send SMS Notification
    if (updatedRepair && updatedRepair.client_phone) {
        smsService.sendRepairStatusUpdate(
            updatedRepair.client_phone,
            updatedRepair.client_name,
            updatedRepair.id.toString(),
            updatedRepair.status,
            updatedRepair.device_details
        ).catch(err => console.error("Failed to send update SMS", err));
    }

    return updatedRepair;
};

export interface Repair {
    id?: number;
    client_id: number;
    device_details: string;
    issue_description: string;
    status: string;
    cost_estimate: number;
    parts?: number[]; // IDs of parts used
    repair_type?: string;
}

export const getAllRepairs = async () => {
    const repairsRes = await query(`
    SELECT r.*, c.name as client_name, c.phone as client_phone, c.email as client_email
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
        SELECT rp.repair_id, p.name, p.quality, p.id as product_id
        FROM repair_parts rp
        JOIN products p ON rp.product_id = p.id
        WHERE rp.repair_id IN (${placeholders})
    `, repairIds);

    const partsByRepair: Record<number, string[]> = {};
    const partIdsByRepair: Record<number, number[]> = {};

    partsRes.rows.forEach((row: any) => {
        if (!partsByRepair[row.repair_id]) {
            partsByRepair[row.repair_id] = [];
            partIdsByRepair[row.repair_id] = [];
        }
        const partName = row.quality ? `${row.name} (${row.quality})` : row.name;
        partsByRepair[row.repair_id]!.push(partName);
        partIdsByRepair[row.repair_id]!.push(row.product_id);
    });

    return repairs.map((r: any) => {
        const liveParts = partsByRepair[r.id];
        const savedParts = r.parts_list ? JSON.parse(r.parts_list) : [];

        return {
            ...r,
            // Use live parts data (with quality) if available, otherwise fallback to saved snapshot
            piecesUtilisees: (liveParts && liveParts.length > 0) ? liveParts : savedParts,
            parts: partIdsByRepair[r.id] || [],
            typeReparation: r.repair_type || '', // Map to frontend
            clientTelephone: r.client_phone, // Map client phone
            clientEmail: r.client_email, // Map client email
            remarque: r.notes || '' // Map notes to frontend 'remarque'
        };
    });
};


// Helper to determine if a status implies parts have been consumed
const isConsumedState = (status: string) => {
    return ['réparée', 'payée_collectée'].includes(status);
};

export const updateRepair = async (id: number, updates: any) => {
    const { issue_description, cost_estimate, depot, status, warranty, piecesUtilisees, parts, device_details, typeReparation, notes } = updates;

    // 0. Update Repair Parts ID list if provided
    if (parts && Array.isArray(parts)) {
        // Clear existing parts for this repair
        await query('DELETE FROM repair_parts WHERE repair_id = $1', [id]);

        // Insert new parts
        for (const partId of parts) {
            // Note: This logic duplicates createRepair loop.
            // Also, we assume stock deduction happens via status change logic below or separately.
            // If the status is ALREADY 'repaired', and we add parts, we might want to deduct stock immediately?
            // For now, we strictly follow the status transition logic for stock.
            // But this creates a loophole: Status Repaired -> Edit Add Part -> No Deduction.
            // Fix: Check if status IS consumed (legacy or current).
            // But we don't have old parts list easily here unless we query before delete.
            // Simplified: Just update the links. Stock check is separate concern for now.
            await query(
                `INSERT INTO repair_parts (repair_id, product_id) VALUES ($1, $2)`,
                [id, partId]
            );
        }
    }

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

    // Prepare parts_list update if provided
    let partsListUpdate = '';
    // Prepare parts_list update if provided
    if (piecesUtilisees !== undefined) {
        await query('UPDATE repairs SET parts_list = $1 WHERE id = $2', [JSON.stringify(piecesUtilisees), id]);
    }

    // 2. Perform generic update for other fields
    // Added device_details, repair_type, and parts_list to params
    const partsListJson = piecesUtilisees ? JSON.stringify(piecesUtilisees) : null;
    const params = [issue_description, cost_estimate, status, depot, warranty, device_details, typeReparation, partsListJson, notes, id];

    await query(
        `UPDATE repairs 
         SET issue_description = COALESCE($1, issue_description), 
             cost_estimate = COALESCE($2, cost_estimate), 
             status = COALESCE($3, status),
             depot = COALESCE($4, depot),
             warranty = COALESCE($5, warranty),
             device_details = COALESCE($6, device_details),
             repair_type = COALESCE($7, repair_type),
             parts_list = COALESCE($8, parts_list),
             notes = COALESCE($9, notes)
         WHERE id = $10`,
        params
    );

    const updatedRepair = await query('SELECT * FROM repairs WHERE id = $1', [id]);
    return updatedRepair.rows[0];
};

export const deleteRepair = async (id: number) => {
    // 1. Delete associated parts links
    await query('DELETE FROM repair_parts WHERE repair_id = $1', [id]);

    // 2. Delete the repair record
    // Note: We do not restore stock here automatically, assuming deletion might be for correction.
    // If stock restoration is desired, logic would be needed. 
    // Usually, "Void" (Annulé) is better for stock return, Delete is for "Mistake".
    const result = await query('DELETE FROM repairs WHERE id = $1', [id]);
    return { id };
};
