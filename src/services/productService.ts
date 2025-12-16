import api from './api';
import { Product } from '../app/types';

const mapFromApi = (data: any): Product => {
    if (!data) {
        return {
            id: Math.random().toString(),
            nom: 'Produit Inconnu',
            codeBarres: '',
            quantite: 0,
            prixAchat: 0,
            prixVente: 0,
            alerteStock: 0,
            categorie: 'Divers'
        };
    }
    return {
        id: (data.id || Math.random()).toString(),
        nom: data.name || 'Inconnu',
        codeBarres: data.sku || '',
        quantite: Number(data.stock_quantity || 0),
        prixAchat: Number(data.purchase_price || 0),
        prixVente: Number(data.price || 0),
        alerteStock: Number(data.min_stock_alert || 5),
        categorie: data.category || 'Divers',
        section: data.section || 'Accessoires',
        quality: data.quality || ''
    };
};

export const getProducts = async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get('/products', { params });
    if (!Array.isArray(response.data)) return [];
    return response.data.map(mapFromApi);
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
    // Map Frontend to Backend
    const payload = {
        name: product.nom,
        sku: product.codeBarres,
        price: product.prixVente,
        stock_quantity: product.quantite,
        category: product.categorie,
        min_stock_alert: product.alerteStock,
        purchase_price: product.prixAchat,
        section: product.section,
        quality: product.quality
    };
    const response = await api.post('/products', payload);
    return mapFromApi(response.data);
};

export const getProductBySku = async (sku: string) => {
    try {
        const response = await api.get(`/products/sku/${sku}`);
        return mapFromApi(response.data);
    } catch (error) {
        return null;
    }
};

export const updateProduct = async (id: string, product: Omit<Product, 'id'>) => {
    const payload = {
        name: product.nom,
        sku: product.codeBarres,
        price: product.prixVente,
        stock_quantity: product.quantite,
        category: product.categorie,
        min_stock_alert: product.alerteStock,
        purchase_price: product.prixAchat,
        section: product.section,
        quality: product.quality
    };
    const response = await api.put(`/products/${id}`, payload);
    return mapFromApi(response.data);
};

export const deleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
};
