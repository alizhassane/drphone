import { query } from '../config/db';

const migrate = async () => {
    console.log('Running migration: Create users table');
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                role TEXT DEFAULT 'Vendeur',
                statut TEXT DEFAULT 'Actif',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Success: Created users table');

        // Insert admin user if empty
        const userCheck = await query('SELECT count(*) as count FROM users');
        if (userCheck.rows[0].count === 0) {
            await query(`
                INSERT INTO users (username, password, name, email, role)
                VALUES ('admin', 'admin123', 'Administrateur', 'admin@drphone.com', 'Admin')
            `);
            console.log('Inserted default admin user');
        }

    } catch (e) {
        console.error('Migration failed:', e);
    }
};

migrate();
