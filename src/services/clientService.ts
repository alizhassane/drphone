import api from './api';
import { Client } from '../app/types';

// Helper to map Backend (name, created_at) to Frontend (nom, prenom, dateCreation)
const mapFromApi = (data: any): Client => {
    const fullName = data.name || 'Inconnu';
    const parts = fullName.split(' ');
    const prenom = parts[0];
    const nom = parts.slice(1).join(' ') || '';

    return {
        id: data.id.toString(),
        prenom,
        nom,
        telephone: data.phone || '',
        email: data.email || '',
        dateCreation: data.created_at || new Date().toISOString(),
        adresse: data.address // Passed if available
    };
};

export const getClients = async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get('/clients', { params });
    if (!Array.isArray(response.data)) return [];
    return response.data.map(mapFromApi);
};

export const createClient = async (client: Omit<Client, 'id' | 'dateCreation'>) => {
    // Helper to map Frontend (nom, prenom) to Backend (name)
    const payload = {
        name: `${client.prenom} ${client.nom}`.trim(),
        phone: client.telephone,
        email: client.email,
        address: client.adresse // Pass address if available, backend will likely ignore if no column, but helpful if added later
    };
    const response = await api.post('/clients', payload);
    return mapFromApi(response.data);
};

export const updateClient = async (id: string, updates: Partial<Client>) => {
    // Map updates to backend format
    const payload: any = {};
    if (updates.nom !== undefined) payload.name = updates.nom; // EditClientModal sends full name as 'nom' currently
    if (updates.telephone !== undefined) payload.phone = updates.telephone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.adresse !== undefined) payload.address = updates.adresse;

    const response = await api.put(`/clients/${id}`, payload);
    return mapFromApi(response.data);
};

export const getClientHistory = async (id: string) => {
    const response = await api.get(`/clients/${id}/history`);
    return response.data; // Returns { repairs: [...], sales: [...] }
};
