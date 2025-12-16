import { query } from '../config/db.js';
export const getAllPayments = async () => {
    const result = await query('SELECT * FROM payments ORDER BY date DESC');
    return result.rows;
};
//# sourceMappingURL=paymentService.js.map