
import { getDb } from '../config/db.js';

export const getSettings = async () => {
    const db = await getDb();
    const rows = await db.all<{ key: string, value: string }[]>('SELECT key, value FROM settings');
    return rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
};

export const updateSetting = async (key: string, value: string) => {
    const db = await getDb();
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
};

export const updateSettings = async (settings: Record<string, string>) => {
    const db = await getDb();
    const stmts = Object.entries(settings).map(([key, value]) => {
        return db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
    });
    await Promise.all(stmts);
    return await getSettings();
};
