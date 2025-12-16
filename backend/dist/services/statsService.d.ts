export declare const getDashboardStats: () => Promise<{
    todaySales: number;
    monthSales: number;
    todayProfit: number;
    ongoingRepairs: number;
    lowStockCount: number;
    recentRepairs: any[] | never[];
    lowStockItems: any[] | never[];
}>;
export declare const getDailyStats: () => Promise<any[] | never[]>;
//# sourceMappingURL=statsService.d.ts.map