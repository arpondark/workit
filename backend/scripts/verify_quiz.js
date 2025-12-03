const http = require('http');

const get = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
};

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

const verify = async () => {
    try {
        console.log('Fetching skills...');
        const skillsRes = await get('http://localhost:5000/api/quiz/skills');
        console.log('Skills response:', JSON.stringify(skillsRes, null, 2));
        if (!skillsRes.success || !skillsRes.skills || !skillsRes.skills.length) {
            throw new Error('No skills found');
        }

        const skill = skillsRes.skills.find(s => s.name === 'Web Development') || skillsRes.skills[0];
        console.log(`Found skill: ${skill.name} (${skill._id})`);

        console.log('Starting quiz...');
        const quizRes = await post('http://localhost:5000/api/quiz/start', JSON.stringify({
            skillId: skill._id,
            email: 'test@example.com'
        }));

        if (!quizRes.success) {
            throw new Error(`Failed to start quiz: ${quizRes.message}`);
        }

        console.log(`Quiz started. Questions count: ${quizRes.questions.length}`);

        if (quizRes.questions.length === 5) {
            console.log('✅ verification PASSED: 5 questions returned');
        } else {
            console.log(`❌ verification FAILED: Expected 5 questions, got ${quizRes.questions ? quizRes.questions.length : 'undefined'}`);
            console.log('Full response:', JSON.stringify(quizRes, null, 2));
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) console.log('Response:', error.response);
    }
};

verify();
