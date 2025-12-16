import api from './api';

export interface DashboardStats {
    todaySales: number;
    monthSales: number;
    todayProfit: number;
    ongoingRepairs: number;
    lowStockCount: number;
    recentRepairs: any[];
    lowStockItems: any[];
}

export interface DailyStat {
    date: string;
    sales: number;
    transaction_count: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/stats/dashboard');
    return response.data;
};

export const getDailyStats = async (): Promise<DailyStat[]> => {
    const response = await api.get('/stats/daily');
    return response.data;
};
