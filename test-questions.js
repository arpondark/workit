const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testQuestionsAPI() {
    try {
        // First login to get token
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'arponarpon007@gmail.com',
                password: '12345678'
            })
        });

        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        if (!loginData.success) {
            console.error('Login failed:', loginData.message);
            return;
        }

        const token = loginData.token;

        // Test get questions
        const questionsResponse = await fetch('http://localhost:5000/api/admin/questions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const questionsData = await questionsResponse.json();
        console.log('Questions response:', JSON.stringify(questionsData, null, 2));

        // Test create question
        const createResponse = await fetch('http://localhost:5000/api/admin/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                skill: '69306cfcfc0fe2a7981a28bf', // Web Development skill ID from the response
                question: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1,
                difficulty: 'easy',
                explanation: '2 + 2 = 4',
                isActive: true
            })
        });

        const createData = await createResponse.json();
        console.log('Create question response:', JSON.stringify(createData, null, 2));
        
        if (createData.success) {
            // Test update question
            const updateResponse = await fetch(`http://localhost:5000/api/admin/questions/${createData.question._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    skill: '69306cfcfc0fe2a7981a28bf', // Web Development skill ID
                    question: 'What is 3 + 3? (Updated)',
                    options: ['5', '6', '7', '8'],
                    correctAnswer: 1,
                    difficulty: 'easy',
                    explanation: '3 + 3 = 6',
                    isActive: true
                })
            });

            const updateData = await updateResponse.json();
            console.log('Update question response:', JSON.stringify(updateData, null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testQuestionsAPI();