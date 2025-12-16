import api from './api';

export interface SaleItemInput {
    product_id?: number | null;
    quantity: number;
    unit_price: number;
    is_manual: boolean;
    manual_name?: string;
}

export interface SaleInput {
    total_amount: number;
    tax_tps: number;
    tax_tvq: number;
    final_total: number;
    payment_method: string;
    items: SaleItemInput[];
}

export const createSale = async (sale: SaleInput) => {
    const response = await api.post('/sales', sale);
    return response.data;
};

export const getSales = async () => {
    const response = await api.get('/sales');
    return response.data;
};
