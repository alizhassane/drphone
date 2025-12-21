import api from './api';

export interface ModelData {
    id: number; // DB ID
    name: string;
}

export interface BrandData {
    id: string;
    name: string;
    models: string[]; // Hierarchy returns string format for models
}

export interface DeviceCategoryData {
    id: string;
    name: string;
    brands: BrandData[];
    parts: string[];
}

export const getHierarchy = async (): Promise<DeviceCategoryData[]> => {
    const response = await api.get('/inventory/hierarchy');
    return response.data;
};

// --- Management ---
export const addCategory = async (id: string, name: string) => {
    const response = await api.post('/inventory/categories', { id, name });
    return response.data;
};

export const deleteCategory = async (id: string) => {
    const response = await api.delete(`/inventory/categories/${id}`);
    return response.data;
};

export const addBrand = async (categoryId: string, name: string) => {
    const response = await api.post('/inventory/brands', { categoryId, name });
    return response.data;
};

export const deleteBrand = async (id: string) => {
    const response = await api.delete(`/inventory/brands/${id}`);
    return response.data;
};

export const addModel = async (brandId: string, name: string) => {
    const response = await api.post('/inventory/models', { brandId, name });
    return response.data;
};

export const deleteModel = async (brandId: string, name: string) => {
    // Using query params for delete-by-name logic backend supports
    const response = await api.delete('/inventory/models', {
        params: { brandId, name }
    });
    return response.data;
};
