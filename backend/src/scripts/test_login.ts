import fetch from 'node-fetch';

const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Body:', data);
    } catch (e) {
        console.error('Fetch error:', e);
    }
};

testLogin();
