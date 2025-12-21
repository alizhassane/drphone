import api from './api';
import type { User } from '../app/types';

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (user: Partial<User>): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
};

export const updateUser = async (user: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${user.id}`, user);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};

export const login = async (username: string, password: string): Promise<User> => {
    const response = await api.post('/users/login', { username, password });
    return response.data;
};
