require('dotenv').config();
const http = require('http');

const post = (url, body) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
};

const get = (url, token) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });
};

const verify = async () => {
    try {
        console.log('Logging in as admin...');
        const email = process.env.ADMIN_EMAIL || 'admin@workit.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        const loginRes = await post('http://localhost:5000/api/auth/admin/login', JSON.stringify({
            email,
            password
        }));

        if (!loginRes.success) {
            throw new Error(`Admin login failed: ${loginRes.message}`);
        }

        console.log('Admin logged in. Fetching questions...');
        const questionsRes = await get('http://localhost:5000/api/admin/questions', loginRes.token);

        console.log('Questions response keys:', Object.keys(questionsRes));

        if (questionsRes.questions && Array.isArray(questionsRes.questions)) {
            console.log(`✅ Verification PASSED: 'questions' array found with ${questionsRes.questions.length} items.`);
        } else {
            console.log('❌ Verification FAILED: questions array missing.');
            console.log('Response:', JSON.stringify(questionsRes, null, 2));
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
};

verify();
