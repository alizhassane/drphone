
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/inventory';

(async () => {
    try {
        console.log('Testing Add Model API...');
        const payload = { brandId: 'phone_apple', name: 'API Test iPhone 16' };
        console.log('Sending:', payload);

        const response = await axios.post(`${API_URL}/models`, payload);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

    } catch (error: any) {
        console.error('API Request Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
})();
