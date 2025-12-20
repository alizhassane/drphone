
import api from './api';

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

export const getPhones = async (filters: { status?: string } = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/phones?${params.toString()}`);
    return response.data;
};

export const getPhoneById = async (id: string) => {
    const response = await api.get(`/phones/${id}`);
    return response.data;
};

export const buyPhone = async (data: any) => {
    const response = await api.post('/phones/buy', data);
    return response.data;
};

export const updatePhone = async (id: string, updates: Partial<Phone>) => {
    const response = await api.put(`/phones/${id}`, updates);
    return response.data;
};
