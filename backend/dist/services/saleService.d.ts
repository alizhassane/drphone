export interface SaleItem {
    product_id?: number | null;
    quantity: number;
    unit_price: number;
    is_manual: boolean;
    manual_name?: string;
}
export interface Sale {
    total_amount: number;
    tax_tps: number;
    tax_tvq: number;
    final_total: number;
    payment_method: string;
    items: SaleItem[];
}
export declare const createSale: (sale: Sale) => Promise<any>;
export declare const getAllSales: () => Promise<any[]>;
//# sourceMappingURL=saleService.d.ts.map