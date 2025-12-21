import { query } from '../config/db';

const checkUsers = async () => {
    console.log('Checking users table...');
    try {
        const result = await query('SELECT * FROM users');
        console.log('Users found:', result.rows);
    } catch (e) {
        console.error('Error querying users:', e);
    }
};

checkUsers();
