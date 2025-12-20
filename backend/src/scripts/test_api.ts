
// import fetch from 'node-fetch'; // Native fetch in Node 18+

const run = async () => {
    try {
        console.log('Testing backend connectivity...');
        const res = await fetch('http://127.0.0.1:5001/api/products');
        console.log('Response status:', res.status);
        if (res.ok) {
            console.log('Backend is reachable.');

            // Try creating a repair
            console.log('Attempting to create repair...');
            const payload = {
                client_id: 1, // Assumes client ID 1 exists
                device_details: "Test Device",
                issue_description: "Test Loop",
                status: "reçue",
                cost_estimate: 100,
                warranty: 90,
                parts: []
            };
            const postRes = await fetch('http://127.0.0.1:5001/api/repairs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Create Repair Status:', postRes.status);
            const text = await postRes.text();
            console.log('Body:', text);

        } else {
            console.log('Backend returned error:', res.statusText);
        }
    } catch (e: any) {
        console.log('Failed to connect to backend on 5001:', e.message);
        console.log('Trying port 5000...');
        try {
            const res = await fetch('http://127.0.0.1:5000/api/products');
            if (res.ok) console.log('Backend is reachable on 5000.');
            else console.log('Backend error on 5000:', res.statusText);
        } catch (e2: any) {
            console.log('Failed 5000:', e2.message);
        }
    }
};

run();
