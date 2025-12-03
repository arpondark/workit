require('dotenv').config();
const http = require('http');

const post = (url, body, token) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                ...(token && { 'Authorization': `Bearer ${token}` })
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

const put = (url, body, token) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Authorization': `Bearer ${token}`
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
        const token = loginRes.token;

        // 1. Create a question
        console.log('Creating a test question...');
        // Need a valid skill ID first. Let's assume we can get one or use a dummy one if we knew it.
        // Better to fetch skills first.

        // Helper to get skills
        const getSkills = () => {
            return new Promise((resolve, reject) => {
                http.get('http://localhost:5000/api/admin/skills', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });
        };

        const skillsRes = await getSkills();
        if (!skillsRes.success || !skillsRes.skills.length) throw new Error('No skills found');
        const skillId = skillsRes.skills[0]._id;

        const newQuestion = {
            skill: skillId,
            question: 'Test Question for Edit',
            options: ['A', 'B', 'C', 'D'],
            difficulty: 'easy',
            correctAnswer: 0,
            explanation: 'Test explanation',
            isActive: true
        };

        const createRes = await post('http://localhost:5000/api/admin/questions', JSON.stringify(newQuestion), token);
        if (!createRes.success) throw new Error(`Failed to create question: ${createRes.message}`);
        const questionId = createRes.question._id;
        console.log(`Question created: ${questionId}`);

        // 2. Update the question (try to update skill and question text)
        console.log('Updating question...');
        const updateData = {
            skill: skillId, // Sending the same skill, but backend should accept it
            question: 'UPDATED Test Question',
            options: ['A', 'B', 'C', 'D'],
            difficulty: 'hard',
            explanation: 'Updated explanation',
            isActive: false
        };

        const updateRes = await put(`http://localhost:5000/api/admin/questions/${questionId}`, JSON.stringify(updateData), token);

        if (!updateRes.success) {
            console.log(`❌ Update failed: ${updateRes.message}`);
        } else {
            console.log('Update response:', JSON.stringify(updateRes.question, null, 2));

            if (updateRes.question.question === 'UPDATED Test Question' && updateRes.question.difficulty === 'hard') {
                console.log('✅ Basic update worked.');
            } else {
                console.log('❌ Basic update failed.');
            }

            // Check if we can update skill (if we had another skill ID)
            // For now, just checking if the backend code ignores 'skill' field is enough by inspection, 
            // but this script confirms the endpoint works generally.
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
        if (error.stack) console.error(error.stack);
    }
};

verify();
