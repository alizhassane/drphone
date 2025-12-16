import { query } from '../config/db.js';
export const getAllRepairs = async () => {
    const result = await query(`
    SELECT r.*, c.name as client_name 
    FROM repairs r 
    JOIN clients c ON r.client_id = c.id 
    ORDER BY r.created_at DESC
  `);
    return result.rows;
};
export const createRepair = async (repair) => {
    const { client_id, device_details, issue_description, cost_estimate } = repair;
    const result = await query('INSERT INTO repairs (client_id, device_details, issue_description, status, cost_estimate) VALUES ($1, $2, $3, $4, $5)', [client_id, device_details, issue_description, 'Pending', cost_estimate]);
    // Fetch inserted
    const newRepair = await query('SELECT * FROM repairs WHERE id = $1', [result.lastID]);
    return newRepair.rows[0];
};
export const updateRepairStatus = async (id, status) => {
    await query('UPDATE repairs SET status = $1 WHERE id = $2', [status, id]);
    // Fetch updated
    const updatedRepair = await query('SELECT * FROM repairs WHERE id = $1', [id]);
    return updatedRepair.rows[0];
};
//# sourceMappingURL=repairService.js.map