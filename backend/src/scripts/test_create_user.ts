import fetch from 'node-fetch';

const testCreateUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "testuser",
                password: "123",
                nom: "Test User",
                email: "test@drphone.com",
                role: "Technicien",
                statut: "Actif"
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Body:', data);
    } catch (e) {
        console.error('Fetch error:', e);
    }
};

testCreateUser();
