import api from './api';
import { Repair } from '../app/types';

const mapFromApi = (data: any): Repair => {
    if (!data) {
        return {
            id: Math.random().toString(),
            numeroTicket: 'ERR',
            clientId: '0',
            clientNom: 'Données manquantes',
            modelePhone: '?',
            typeReparation: '?',
            description: '',
            statut: 'reçue',
            prix: 0,
            depot: 0,
            piecesUtilisees: [],
            garantie: 0,
            dateCreation: new Date().toISOString()
        };
    }
    return {
        id: (data.id || Math.random()).toString(),
        numeroTicket: data.id ? `REP-${data.id}` : 'REP-ERR',
        clientId: (data.client_id || '').toString(),
        clientNom: data.client_name || data.clientNom || 'Inconnu', // Handle both snake_case and potential camelCase if passed from elsewhere
        modelePhone: data.device_details || data.modelePhone || '',
        typeReparation: 'Réparation',
        description: data.issue_description || data.description || '',
        statut: data.status || data.statut || 'reçue',
        prix: parseFloat(data.cost_estimate || data.prix || 0),
        depot: parseFloat(data.depot || 0),
        piecesUtilisees: data.parts ? data.parts.map((p: any) => p.product_name || p.nom) : [],
        garantie: data.warranty !== undefined ? data.warranty : 90, // Default to 90 days if not specified
        dateCreation: data.created_at || new Date().toISOString()
    };
};

export const getRepairs = async () => {
    const response = await api.get('/repairs');
    if (!Array.isArray(response.data)) return [];
    return response.data.map(mapFromApi);
};

export const createRepair = async (repair: Omit<Repair, 'id'>) => {
    const payload = {
        client_id: parseInt(repair.clientId),
        device_details: repair.modelePhone,
        issue_description: `${repair.typeReparation} - ${repair.description || ''}`,
        status: repair.statut || 'Pending',
        cost_estimate: repair.prix,
        parts: (repair as any).parts,
        warranty: repair.garantie // Map frontend 'garantie' to backend 'warranty'
    };
    const response = await api.post('/repairs', payload);
    return mapFromApi(response.data);
};

export const updateRepairStatus = async (id: number, status: string) => {
    const response = await api.put(`/repairs/${id}/status`, { status });
    return mapFromApi(response.data);
};

export const updateRepair = async (id: number, updates: Partial<Repair>) => {
    // Map frontend fields (garantie) to backend expected fields (warranty)
    const payload = {
        issue_description: updates.description,
        cost_estimate: updates.prix,
        depot: updates.depot,
        status: updates.statut,
        warranty: updates.garantie // Map frontend 'garantie' to backend 'warranty'
    };
    const response = await api.put(`/repairs/${id}`, payload);
    return mapFromApi(response.data);
};
