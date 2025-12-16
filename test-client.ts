
import axios from 'axios';

const testCreateClient = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/clients', {
            name: 'Test Client',
            phone: '1234567890',
            email: 'test@example.com'
        });
        console.log('Success:', res.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testCreateClient();
