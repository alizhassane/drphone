import { query } from '../config/db';

export interface User {
    id: string; // Cast to string for frontend compatibility
    username: string;
    password?: string; // Optional on return, required on creation/update if changing
    name: string;
    email?: string;
    role: string;
    statut: string;
    created_at?: string;
}

export const getUsers = async (): Promise<User[]> => {
    const result = await query('SELECT id, username, name, email, role, statut, created_at FROM users ORDER BY created_at DESC');
    return result.rows.map(row => ({
        ...row,
        id: row.id.toString()
    }));
};

export const createUser = async (user: User): Promise<User> => {
    const { username, password, name, email, role, statut } = user;
    try {
        const result = await query(
            'INSERT INTO users (username, password, name, email, role, statut) VALUES ($1, $2, $3, $4, $5, $6)',
            [username, password, name, email, role, statut || 'Actif']
        );
        // For SQLite, insert returns info in result, not rows (unless RETURNING used, but safer to use lastID)
        // db.ts wrapper returns { rows, rowCount, lastID } for non-selects
        // Note: result.rows is empty.

        // We need the ID. 
        // If query returns generic result with lastID:
        return { ...user, id: result.lastID?.toString() || Date.now().toString() };
    } catch (e: any) {
        if (e.message && e.message.includes('UNIQUE constraint failed')) {
            throw new Error('Username already taken');
        }
        throw e;
    }
};

export const updateUser = async (user: User): Promise<User> => {
    const { id, username, password, name, email, role, statut } = user;

    let sql = 'UPDATE users SET username = $1, name = $2, email = $3, role = $4, statut = $5';
    const params: any[] = [username, name, email, role, statut];
    let idx = 6;

    if (password) {
        sql += `, password = $${idx}`;
        params.push(password);
        idx++;
    }

    sql += ` WHERE id = $${idx}`;
    params.push(id);

    try {
        await query(sql, params);
        return user;
    } catch (e: any) {
        if (e.message && e.message.includes('UNIQUE constraint failed')) {
            throw new Error('Username already taken');
        }
        throw e;
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    await query('DELETE FROM users WHERE id = $1', [id]);
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    // Simple password check (plaintext for now as stored)
    if (user.password === password) {
        return {
            ...user,
            id: user.id.toString()
        };
    }
    return null;
};
