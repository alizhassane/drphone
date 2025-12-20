import { query } from '../config/db.js';

export const getDashboardStats = async () => {
    // SQLite date format is YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // 1. Today's Sales
    const todaySalesRes = await query(
        `SELECT COALESCE(SUM(final_total), 0) as total 
         FROM sales 
         WHERE date(created_at) = $1 AND status != 'Cancelled'`,
        [today]
    );
    const todaySales = parseFloat(todaySalesRes.rows[0]?.total || 0);

    // 2. Month's Sales
    // Postgres: to_char(created_at, 'YYYY-MM')
    // SQLite: strftime('%Y-%m', created_at)
    const monthSalesRes = await query(
        `SELECT COALESCE(SUM(final_total), 0) as total 
         FROM sales 
         WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') 
         AND status != 'Cancelled'`
    );
    const monthSales = parseFloat(monthSalesRes.rows[0]?.total || 0);

    // 3. Today's Profit (Estimation)
    const todayProfit = todaySales * 0.45;

    // 4. Ongoing Repairs
    const repairsRes = await query(
        `SELECT COUNT(*) as count 
         FROM repairs 
         WHERE status IN ('reçue', 'en_cours', 'en_attente_pieces')`
    );
    const ongoingRepairs = parseInt(repairsRes.rows[0]?.count || 0);

    // 5. Low Stock
    const lowStockRes = await query(
        `SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_alert`
    );
    const lowStockCount = parseInt(lowStockRes.rows[0]?.count || 0);

    // 6. Recent Repairs (Top 5)
    // Client name join
    const recentRepairsRes = await query(
        `SELECT r.*, c.name as client_name 
         FROM repairs r
         LEFT JOIN clients c ON r.client_id = c.id
         ORDER BY r.created_at DESC 
         LIMIT 5`
    );

    // 7. Low Stock Items (List)
    const lowStockItemsRes = await query(
        `SELECT * FROM products WHERE stock_quantity <= min_stock_alert LIMIT 5`
    );

    // 8. Phones in Stock
    const phonesRes = await query(
        `SELECT COUNT(*) as count FROM phones WHERE status = 'in_stock'`
    );
    const phonesInStock = parseInt(phonesRes.rows[0]?.count || 0);

    return {
        todaySales,
        monthSales,
        todayProfit,
        ongoingRepairs,
        lowStockCount,
        phonesInStock, // NEW
        recentRepairs: recentRepairsRes.rows,
        lowStockItems: lowStockItemsRes.rows
    };
};

export const getDailyStats = async () => {
    // SQLite does not support FULL OUTER JOIN.
    // We use a Recursive CTE to generate the last 30 days, then LEFT JOIN sales and repairs.

    const queryStr = `
        WITH RECURSIVE dates(date) AS (
            SELECT date('now', '-30 days')
            UNION ALL
            SELECT date(date, '+1 day')
            FROM dates
            WHERE date < date('now')
        ),
        SalesStats AS (
            SELECT 
                date(s.created_at) as day,
                SUM(s.final_total) as sales,
                SUM(
                    CASE 
                        WHEN si.product_id IS NOT NULL THEN (si.unit_price - COALESCE(p.purchase_price, 0)) * si.quantity
                        WHEN si.phone_id IS NOT NULL THEN (si.unit_price - COALESCE(ph.buying_price, 0)) * si.quantity
                        ELSE si.unit_price * si.quantity 
                    END
                ) as profits
            FROM sales s
            JOIN sale_items si ON s.id = si.sale_id
            LEFT JOIN products p ON si.product_id = p.id
            LEFT JOIN phones ph ON si.phone_id = ph.id
            WHERE s.created_at >= date('now', '-30 days')
            GROUP BY day
        ),
        RepairStats AS (
            SELECT 
                date(created_at) as day,
                COUNT(*) as repair_count
            FROM repairs
            WHERE created_at >= date('now', '-30 days')
            GROUP BY day
        )
        SELECT 
            d.date,
            COALESCE(s.sales, 0) as ventes,
            COALESCE(s.profits, 0) as profits,
            COALESCE(r.repair_count, 0) as reparations
        FROM dates d
        LEFT JOIN SalesStats s ON d.date = s.day
        LEFT JOIN RepairStats r ON d.date = r.day
        ORDER BY d.date ASC
    `;
    const res = await query(queryStr);
    return res.rows;
};
