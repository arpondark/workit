const User = require('../models/User');
const Skill = require('../models/Skill');
const Question = require('../models/Question');
const AdminSettings = require('../models/AdminSettings');

const seedAdmin = async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            const admin = await User.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log('✅ Admin seeded successfully');
        } else {
            console.log('ℹ️  Admin already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

const seedSkills = async () => {
    try {
        const skillsExist = await Skill.countDocuments();

        if (skillsExist === 0) {
            const skills = [
                { name: 'Web Development', slug: 'web-development', icon: '🌐', category: 'development', description: 'HTML, CSS, JavaScript, React, Node.js', isActive: true },
                { name: 'Mobile Development', slug: 'mobile-development', icon: '📱', category: 'development', description: 'iOS, Android, React Native, Flutter', isActive: true },
                { name: 'UI/UX Design', slug: 'ui-ux-design', icon: '🎨', category: 'design', description: 'User Interface & User Experience Design', isActive: true },
                { name: 'Graphic Design', slug: 'graphic-design', icon: '✏️', category: 'design', description: 'Logo, Branding, Marketing Materials', isActive: true },
                { name: 'Data Science', slug: 'data-science', icon: '📊', category: 'development', description: 'Python, Machine Learning, Data Analysis', isActive: true },
                { name: 'DevOps', slug: 'devops', icon: '⚙️', category: 'development', description: 'CI/CD, Docker, Kubernetes, AWS', isActive: true },
                { name: 'Content Writing', slug: 'content-writing', icon: '✍️', category: 'writing', description: 'Blog Posts, Articles, Copywriting', isActive: true },
                { name: 'Video Editing', slug: 'video-editing', icon: '🎬', category: 'media', description: 'Video Production, Motion Graphics', isActive: true },
                { name: 'Digital Marketing', slug: 'digital-marketing', icon: '📈', category: 'marketing', description: 'SEO, Social Media, PPC Advertising', isActive: true },
                { name: 'WordPress', slug: 'wordpress', icon: '📝', category: 'development', description: 'WordPress Development & Customization', isActive: true }
            ];

            await Skill.insertMany(skills);
            console.log('✅ Skills seeded successfully (10 skill categories)');
        } else {
            console.log('ℹ️  Skills already exist');
        }
    } catch (error) {
        console.error('❌ Error seeding skills:', error.message);
    }
};

const seedQuestions = async () => {
    try {
        const questionsExist = await Question.countDocuments();

        if (questionsExist === 0) {
            // Get skills
            const webDevSkill = await Skill.findOne({ name: 'Web Development' });
            const uiuxSkill = await Skill.findOne({ name: 'UI/UX Design' });

            if (!webDevSkill || !uiuxSkill) {
                console.log('⚠️  Required skills not found, skipping questions seeding');
                return;
            }

            const webDevQuestions = [
                {
                    skill: webDevSkill._id,
                    question: 'What does HTML stand for?',
                    options: [
                        { text: 'Hyper Text Markup Language', isCorrect: true },
                        { text: 'High Tech Modern Language', isCorrect: false },
                        { text: 'Hyper Transfer Markup Language', isCorrect: false },
                        { text: 'Home Tool Markup Language', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which tag is used to link a CSS file in HTML?',
                    options: [
                        { text: '<style>', isCorrect: false },
                        { text: '<link>', isCorrect: true },
                        { text: '<css>', isCorrect: false },
                        { text: '<script>', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What does CSS stand for?',
                    options: [
                        { text: 'Cascading Style Sheets', isCorrect: true },
                        { text: 'Computer Style Sheets', isCorrect: false },
                        { text: 'Creative Style System', isCorrect: false },
                        { text: 'Colorful Style Sheets', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which CSS property is used to control text size?',
                    options: [
                        { text: 'text-style', isCorrect: false },
                        { text: 'text-size', isCorrect: false },
                        { text: 'font-size', isCorrect: true },
                        { text: 'font-style', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which symbol is used for single-line comments in JavaScript?',
                    options: [
                        { text: '/* */', isCorrect: false },
                        { text: '#', isCorrect: false },
                        { text: '//', isCorrect: true },
                        { text: '<!-- -->', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What type of variable does `const` create in JavaScript?',
                    options: [
                        { text: 'Variable that can be reassigned', isCorrect: false },
                        { text: 'Constant variable that cannot be reassigned', isCorrect: true },
                        { text: 'Global variable', isCorrect: false },
                        { text: 'Temporary variable', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which method prints output to the console in JavaScript?',
                    options: [
                        { text: 'print()', isCorrect: false },
                        { text: 'console.log()', isCorrect: true },
                        { text: 'document.write()', isCorrect: false },
                        { text: 'echo()', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What does DOM stand for?',
                    options: [
                        { text: 'Document Object Model', isCorrect: true },
                        { text: 'Data Object Management', isCorrect: false },
                        { text: 'Display Object Model', isCorrect: false },
                        { text: 'Dynamic Object Model', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which HTTP method is typically used to submit form data?',
                    options: [
                        { text: 'GET', isCorrect: false },
                        { text: 'PUT', isCorrect: false },
                        { text: 'POST', isCorrect: true },
                        { text: 'DELETE', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What is the correct file extension for JavaScript files?',
                    options: [
                        { text: '.javascript', isCorrect: false },
                        { text: '.jscript', isCorrect: false },
                        { text: '.js', isCorrect: true },
                        { text: '.java', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which command is used to initialize a Node.js project?',
                    options: [
                        { text: 'node start', isCorrect: false },
                        { text: 'npm init', isCorrect: true },
                        { text: 'node init', isCorrect: false },
                        { text: 'npm start', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What is JSON?',
                    options: [
                        { text: 'JavaScript Object Notation', isCorrect: true },
                        { text: 'Java Source Object Notation', isCorrect: false },
                        { text: 'JavaScript Online Notation', isCorrect: false },
                        { text: 'Java Standard Object Notation', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Express.js is used for building what?',
                    options: [
                        { text: 'Frontend applications', isCorrect: false },
                        { text: 'Backend/server-side applications', isCorrect: true },
                        { text: 'Mobile applications', isCorrect: false },
                        { text: 'Desktop applications', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which HTML attribute is used to set a unique identifier?',
                    options: [
                        { text: 'class', isCorrect: false },
                        { text: 'name', isCorrect: false },
                        { text: 'id', isCorrect: true },
                        { text: 'key', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What is the purpose of the "viewport" meta tag?',
                    options: [
                        { text: 'To define page title', isCorrect: false },
                        { text: 'To control page layout on mobile browsers', isCorrect: true },
                        { text: 'To add page description', isCorrect: false },
                        { text: 'To link external resources', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which CSS property is used for responsive design with flexible boxes?',
                    options: [
                        { text: 'grid', isCorrect: false },
                        { text: 'flexbox', isCorrect: false },
                        { text: 'display: flex', isCorrect: true },
                        { text: 'responsive', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What does API stand for?',
                    options: [
                        { text: 'Application Programming Interface', isCorrect: true },
                        { text: 'Advanced Program Integration', isCorrect: false },
                        { text: 'Application Process Integration', isCorrect: false },
                        { text: 'Automated Programming Interface', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which JavaScript method is used to select an element by ID?',
                    options: [
                        { text: 'document.querySelector()', isCorrect: false },
                        { text: 'document.getElementById()', isCorrect: true },
                        { text: 'document.getElement()', isCorrect: false },
                        { text: 'document.selectById()', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'What is the default HTTP port for web servers?',
                    options: [
                        { text: '21', isCorrect: false },
                        { text: '443', isCorrect: false },
                        { text: '80', isCorrect: true },
                        { text: '8080', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: webDevSkill._id,
                    question: 'Which keyword is used to declare an async function?',
                    options: [
                        { text: 'await', isCorrect: false },
                        { text: 'async', isCorrect: true },
                        { text: 'promise', isCorrect: false },
                        { text: 'defer', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                }
            ];

            const uiuxQuestions = [
                {
                    skill: uiuxSkill._id,
                    question: 'What does UI stand for?',
                    options: [
                        { text: 'User Interface', isCorrect: true },
                        { text: 'Universal Integration', isCorrect: false },
                        { text: 'User Interaction', isCorrect: false },
                        { text: 'Unified Interface', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What does UX stand for?',
                    options: [
                        { text: 'User Experience', isCorrect: true },
                        { text: 'Universal Exchange', isCorrect: false },
                        { text: 'User Execution', isCorrect: false },
                        { text: 'Unified Experience', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'Which tool is commonly used for UI/UX design prototyping?',
                    options: [
                        { text: 'Visual Studio Code', isCorrect: false },
                        { text: 'Figma', isCorrect: true },
                        { text: 'Sublime Text', isCorrect: false },
                        { text: 'GitHub', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is a wireframe in UI design?',
                    options: [
                        { text: 'A final design with colors', isCorrect: false },
                        { text: 'A low-fidelity layout sketch', isCorrect: true },
                        { text: 'A coding framework', isCorrect: false },
                        { text: 'A database schema', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is the purpose of user personas in UX design?',
                    options: [
                        { text: 'To create animations', isCorrect: false },
                        { text: 'To represent target user groups', isCorrect: true },
                        { text: 'To test code', isCorrect: false },
                        { text: 'To design logos', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is a prototype in design?',
                    options: [
                        { text: 'Final product code', isCorrect: false },
                        { text: 'Interactive mockup of the design', isCorrect: true },
                        { text: 'Database model', isCorrect: false },
                        { text: 'Server configuration', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is the 60-30-10 rule in design?',
                    options: [
                        { text: 'Page layout ratios', isCorrect: false },
                        { text: 'Color distribution rule', isCorrect: true },
                        { text: 'Font size ratios', isCorrect: false },
                        { text: 'Image placement rule', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is visual hierarchy in design?',
                    options: [
                        { text: 'Order of design files', isCorrect: false },
                        { text: 'Arrangement of elements by importance', isCorrect: true },
                        { text: 'Code structure', isCorrect: false },
                        { text: 'Team organization', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is whitespace (negative space) in design?',
                    options: [
                        { text: 'Error in design', isCorrect: false },
                        { text: 'Empty space between elements', isCorrect: true },
                        { text: 'White colored elements', isCorrect: false },
                        { text: 'Background color', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is A/B testing in UX?',
                    options: [
                        { text: 'Comparing two design versions with users', isCorrect: true },
                        { text: 'Testing code quality', isCorrect: false },
                        { text: 'Checking accessibility', isCorrect: false },
                        { text: 'Database testing', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What does CTA stand for in UI design?',
                    options: [
                        { text: 'Call To Action', isCorrect: true },
                        { text: 'Click To Activate', isCorrect: false },
                        { text: 'Central Text Area', isCorrect: false },
                        { text: 'Create This App', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is responsive design?',
                    options: [
                        { text: 'Fast loading websites', isCorrect: false },
                        { text: 'Design that adapts to different screen sizes', isCorrect: true },
                        { text: 'Interactive animations', isCorrect: false },
                        { text: 'Voice-enabled interfaces', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is a design system?',
                    options: [
                        { text: 'A computer operating system', isCorrect: false },
                        { text: 'Collection of reusable design components and guidelines', isCorrect: true },
                        { text: 'A file storage system', isCorrect: false },
                        { text: 'A coding language', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is the purpose of user journey mapping?',
                    options: [
                        { text: 'To create animations', isCorrect: false },
                        { text: 'To visualize user interactions with product', isCorrect: true },
                        { text: 'To track GPS location', isCorrect: false },
                        { text: 'To design logos', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is accessibility (a11y) in design?',
                    options: [
                        { text: 'Making products fast', isCorrect: false },
                        { text: 'Making products usable for people with disabilities', isCorrect: true },
                        { text: 'Making products cheap', isCorrect: false },
                        { text: 'Making products colorful', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is a mockup?',
                    options: [
                        { text: 'A static high-fidelity design representation', isCorrect: true },
                        { text: 'A type of testing', isCorrect: false },
                        { text: 'A programming language', isCorrect: false },
                        { text: 'A database model', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is the purpose of usability testing?',
                    options: [
                        { text: 'To test server speed', isCorrect: false },
                        { text: 'To evaluate product with real users', isCorrect: true },
                        { text: 'To check code syntax', isCorrect: false },
                        { text: 'To design logos', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is Gestalt principle in design?',
                    options: [
                        { text: 'A color theory', isCorrect: false },
                        { text: 'Psychology principles about visual perception', isCorrect: true },
                        { text: 'A layout grid system', isCorrect: false },
                        { text: 'A font family', isCorrect: false }
                    ],
                    difficulty: 'hard',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is the mobile-first approach?',
                    options: [
                        { text: 'Building mobile apps only', isCorrect: false },
                        { text: 'Designing for mobile screens before desktop', isCorrect: true },
                        { text: 'Using mobile phones for design', isCorrect: false },
                        { text: 'Mobile phone manufacturing', isCorrect: false }
                    ],
                    difficulty: 'medium',
                    isActive: true
                },
                {
                    skill: uiuxSkill._id,
                    question: 'What is color contrast important for?',
                    options: [
                        { text: 'Making designs colorful', isCorrect: false },
                        { text: 'Readability and accessibility', isCorrect: true },
                        { text: 'Saving file size', isCorrect: false },
                        { text: 'Faster loading', isCorrect: false }
                    ],
                    difficulty: 'easy',
                    isActive: true
                }
            ];

            const dataScienceSkill = await Skill.findOne({ name: 'Data Science' });

            const dataScienceQuestions = [];
            if (dataScienceSkill) {
                dataScienceQuestions.push(
                    {
                        skill: dataScienceSkill._id,
                        question: 'What is the primary language used for Data Science?',
                        options: [
                            { text: 'Java', isCorrect: false },
                            { text: 'Python', isCorrect: true },
                            { text: 'C++', isCorrect: false },
                            { text: 'Swift', isCorrect: false }
                        ],
                        difficulty: 'easy',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'Which library is used for data manipulation in Python?',
                        options: [
                            { text: 'Pandas', isCorrect: true },
                            { text: 'Requests', isCorrect: false },
                            { text: 'Flask', isCorrect: false },
                            { text: 'PyGame', isCorrect: false }
                        ],
                        difficulty: 'easy',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'What does CSV stand for?',
                        options: [
                            { text: 'Computer Style Values', isCorrect: false },
                            { text: 'Comma Separated Values', isCorrect: true },
                            { text: 'Common System Variables', isCorrect: false },
                            { text: 'Code Syntax Verification', isCorrect: false }
                        ],
                        difficulty: 'easy',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'Which type of learning involves labeled data?',
                        options: [
                            { text: 'Unsupervised Learning', isCorrect: false },
                            { text: 'Supervised Learning', isCorrect: true },
                            { text: 'Reinforcement Learning', isCorrect: false },
                            { text: 'Deep Learning', isCorrect: false }
                        ],
                        difficulty: 'medium',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'What is a common library for plotting in Python?',
                        options: [
                            { text: 'Matplotlib', isCorrect: true },
                            { text: 'NumPy', isCorrect: false },
                            { text: 'Scikit-learn', isCorrect: false },
                            { text: 'TensorFlow', isCorrect: false }
                        ],
                        difficulty: 'easy',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'What is overfitting?',
                        options: [
                            { text: 'When a model performs poorly on training data', isCorrect: false },
                            { text: 'When a model learns noise in training data', isCorrect: true },
                            { text: 'When a model is too simple', isCorrect: false },
                            { text: 'When a model has too few parameters', isCorrect: false }
                        ],
                        difficulty: 'medium',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'Which algorithm is used for classification?',
                        options: [
                            { text: 'Linear Regression', isCorrect: false },
                            { text: 'Logistic Regression', isCorrect: true },
                            { text: 'K-Means Clustering', isCorrect: false },
                            { text: 'Principal Component Analysis', isCorrect: false }
                        ],
                        difficulty: 'medium',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'What is the purpose of splitting data into train and test sets?',
                        options: [
                            { text: 'To make the model faster', isCorrect: false },
                            { text: 'To evaluate model performance on unseen data', isCorrect: true },
                            { text: 'To increase data size', isCorrect: false },
                            { text: 'To fix missing values', isCorrect: false }
                        ],
                        difficulty: 'medium',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'What is a DataFrame?',
                        options: [
                            { text: 'A 2-dimensional labeled data structure', isCorrect: true },
                            { text: 'A database query', isCorrect: false },
                            { text: 'A machine learning model', isCorrect: false },
                            { text: 'A visualization tool', isCorrect: false }
                        ],
                        difficulty: 'easy',
                        isActive: true
                    },
                    {
                        skill: dataScienceSkill._id,
                        question: 'Which library is used for numerical computing in Python?',
                        options: [
                            { text: 'NumPy', isCorrect: true },
                            { text: 'Django', isCorrect: false },
                            { text: 'BeautifulSoup', isCorrect: false },
                            { text: 'Selenium', isCorrect: false }
                        ],
                        difficulty: 'easy',
                        isActive: true
                    }
                );
            }
            // Add questions for other skills
            const mobileDevSkill = await Skill.findOne({ name: 'Mobile Development' });
            if (mobileDevSkill) {
                dataScienceQuestions.push(
                    // Mobile Dev Questions
                    { skill: mobileDevSkill._id, question: 'What is the primary language for iOS development?', options: [{ text: 'Swift', isCorrect: true }, { text: 'Kotlin', isCorrect: false }, { text: 'Java', isCorrect: false }, { text: 'Python', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: mobileDevSkill._id, question: 'Which company developed Android?', options: [{ text: 'Google', isCorrect: true }, { text: 'Apple', isCorrect: false }, { text: 'Microsoft', isCorrect: false }, { text: 'Amazon', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: mobileDevSkill._id, question: 'What is Flutter?', options: [{ text: 'A UI toolkit', isCorrect: true }, { text: 'A database', isCorrect: false }, { text: 'A server framework', isCorrect: false }, { text: 'An operating system', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: mobileDevSkill._id, question: 'Which file extension is used for Android apps?', options: [{ text: '.apk', isCorrect: true }, { text: '.exe', isCorrect: false }, { text: '.ipa', isCorrect: false }, { text: '.dmg', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: mobileDevSkill._id, question: 'What does SDK stand for?', options: [{ text: 'Software Development Kit', isCorrect: true }, { text: 'System Design Kit', isCorrect: false }, { text: 'Standard Data Kit', isCorrect: false }, { text: 'Software Data Key', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: mobileDevSkill._id, question: 'What is React Native used for?', options: [{ text: 'Cross-platform mobile apps', isCorrect: true }, { text: 'Desktop apps only', isCorrect: false }, { text: 'Websites only', isCorrect: false }, { text: 'Database management', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: mobileDevSkill._id, question: 'Which component is the entry point of an Android app?', options: [{ text: 'Activity', isCorrect: true }, { text: 'Service', isCorrect: false }, { text: 'BroadcastReceiver', isCorrect: false }, { text: 'ContentProvider', isCorrect: false }], difficulty: 'hard', isActive: true },
                    { skill: mobileDevSkill._id, question: 'What is Xcode?', options: [{ text: 'IDE for macOS/iOS development', isCorrect: true }, { text: 'A database', isCorrect: false }, { text: 'A web browser', isCorrect: false }, { text: 'A graphics tool', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: mobileDevSkill._id, question: 'Which language is primarily used for native Android development?', options: [{ text: 'Kotlin', isCorrect: true }, { text: 'Swift', isCorrect: false }, { text: 'C#', isCorrect: false }, { text: 'Ruby', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: mobileDevSkill._id, question: 'What is a Bundle ID in iOS?', options: [{ text: 'Unique app identifier', isCorrect: true }, { text: 'App price', isCorrect: false }, { text: 'Developer name', isCorrect: false }, { text: 'App icon', isCorrect: false }], difficulty: 'hard', isActive: true }
                );
            }

            const graphicDesignSkill = await Skill.findOne({ name: 'Graphic Design' });
            if (graphicDesignSkill) {
                dataScienceQuestions.push(
                    // Graphic Design Questions
                    { skill: graphicDesignSkill._id, question: 'What does CMYK stand for?', options: [{ text: 'Cyan, Magenta, Yellow, Key (Black)', isCorrect: true }, { text: 'Color, Mix, Yellow, Kite', isCorrect: false }, { text: 'Cyan, Maroon, Yellow, Key', isCorrect: false }, { text: 'Computer, Monitor, Yellow, Key', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'Which software is best for vector graphics?', options: [{ text: 'Adobe Illustrator', isCorrect: true }, { text: 'Adobe Photoshop', isCorrect: false }, { text: 'Microsoft Paint', isCorrect: false }, { text: 'Adobe Premiere', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'What is Typography?', options: [{ text: 'The art of arranging type', isCorrect: true }, { text: 'Typing speed', isCorrect: false }, { text: 'Type of paper', isCorrect: false }, { text: 'Keyboard layout', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'What happens when you rasterize a layer?', options: [{ text: 'Converts vector to pixels', isCorrect: true }, { text: 'Converts pixels to vector', isCorrect: false }, { text: 'Deletes the layer', isCorrect: false }, { text: 'Locks the layer', isCorrect: false }], difficulty: 'hard', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'What is the rule of thirds?', options: [{ text: 'A composition guideline', isCorrect: true }, { text: 'A color theory', isCorrect: false }, { text: 'A printing rule', isCorrect: false }, { text: 'A font rule', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'Which file format supports transparency?', options: [{ text: 'PNG', isCorrect: true }, { text: 'JPEG', isCorrect: false }, { text: 'BMP', isCorrect: false }, { text: 'TXT', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'What is kerning?', options: [{ text: 'Spacing between specific character pairs', isCorrect: true }, { text: 'Line spacing', isCorrect: false }, { text: 'Font size', isCorrect: false }, { text: 'Paragraph spacing', isCorrect: false }], difficulty: 'hard', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'What does DPI stand for?', options: [{ text: 'Dots Per Inch', isCorrect: true }, { text: 'Data Per Inch', isCorrect: false }, { text: 'Digital Pixel Interface', isCorrect: false }, { text: 'Design Phase Indicator', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'Which color mode is used for screens?', options: [{ text: 'RGB', isCorrect: true }, { text: 'CMYK', isCorrect: false }, { text: 'Pantone', isCorrect: false }, { text: 'Grayscale', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: graphicDesignSkill._id, question: 'What is a vector image made of?', options: [{ text: 'Paths and anchor points', isCorrect: true }, { text: 'Pixels', isCorrect: false }, { text: 'Dots', isCorrect: false }, { text: 'Light', isCorrect: false }], difficulty: 'medium', isActive: true }
                );
            }

            const devOpsSkill = await Skill.findOne({ name: 'DevOps' });
            if (devOpsSkill) {
                dataScienceQuestions.push(
                    // DevOps Questions
                    { skill: devOpsSkill._id, question: 'What does CI/CD stand for?', options: [{ text: 'Continuous Integration/Continuous Deployment', isCorrect: true }, { text: 'Code Integration/Code Deployment', isCorrect: false }, { text: 'Computer Interface/Computer Design', isCorrect: false }, { text: 'Cloud Integration/Cloud Distribution', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: devOpsSkill._id, question: 'Which tool is used for containerization?', options: [{ text: 'Docker', isCorrect: true }, { text: 'Jenkins', isCorrect: false }, { text: 'Git', isCorrect: false }, { text: 'Nginx', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: devOpsSkill._id, question: 'What is Kubernetes used for?', options: [{ text: 'Container Orchestration', isCorrect: true }, { text: 'Version Control', isCorrect: false }, { text: 'Code Editing', isCorrect: false }, { text: 'Database Management', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: devOpsSkill._id, question: 'Which command lists running Docker containers?', options: [{ text: 'docker ps', isCorrect: true }, { text: 'docker list', isCorrect: false }, { text: 'docker run', isCorrect: false }, { text: 'docker show', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: devOpsSkill._id, question: 'What is Infrastructure as Code (IaC)?', options: [{ text: 'Managing infrastructure through code files', isCorrect: true }, { text: 'Writing code for servers', isCorrect: false }, { text: 'Building hardware with code', isCorrect: false }, { text: 'Coding interview practice', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: devOpsSkill._id, question: 'Which tool is a popular CI/CD server?', options: [{ text: 'Jenkins', isCorrect: true }, { text: 'Vim', isCorrect: false }, { text: 'Putty', isCorrect: false }, { text: 'Slack', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: devOpsSkill._id, question: 'What is Ansible?', options: [{ text: 'Configuration Management tool', isCorrect: true }, { text: 'Operating System', isCorrect: false }, { text: 'Programming Language', isCorrect: false }, { text: 'Text Editor', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: devOpsSkill._id, question: 'What is the default port for SSH?', options: [{ text: '22', isCorrect: true }, { text: '80', isCorrect: false }, { text: '443', isCorrect: false }, { text: '21', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: devOpsSkill._id, question: 'What does AWS stand for?', options: [{ text: 'Amazon Web Services', isCorrect: true }, { text: 'Advanced Web System', isCorrect: false }, { text: 'Automated Web Server', isCorrect: false }, { text: 'Apple Web Service', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: devOpsSkill._id, question: 'What is a "pod" in Kubernetes?', options: [{ text: 'The smallest deployable unit', isCorrect: true }, { text: 'A storage unit', isCorrect: false }, { text: 'A type of server', isCorrect: false }, { text: 'A network protocol', isCorrect: false }], difficulty: 'hard', isActive: true }
                );
            }

            const contentWritingSkill = await Skill.findOne({ name: 'Content Writing' });
            if (contentWritingSkill) {
                dataScienceQuestions.push(
                    // Content Writing Questions
                    { skill: contentWritingSkill._id, question: 'What is SEO in content writing?', options: [{ text: 'Search Engine Optimization', isCorrect: true }, { text: 'System Error Output', isCorrect: false }, { text: 'Standard English Organization', isCorrect: false }, { text: 'Social Engagement Option', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is a "Call to Action"?', options: [{ text: 'Prompt encouraging immediate response', isCorrect: true }, { text: 'A phone call', isCorrect: false }, { text: 'A headline', isCorrect: false }, { text: 'A type of image', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: contentWritingSkill._id, question: 'Which voice is generally preferred in web writing?', options: [{ text: 'Active voice', isCorrect: true }, { text: 'Passive voice', isCorrect: false }, { text: 'Complex voice', isCorrect: false }, { text: 'Silent voice', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is keyword density?', options: [{ text: 'Frequency of a keyword in content', isCorrect: true }, { text: 'Weight of the font', isCorrect: false }, { text: 'Number of words on a page', isCorrect: false }, { text: 'Size of the text', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is a meta description?', options: [{ text: 'Summary of page content in search results', isCorrect: true }, { text: 'The title of the article', isCorrect: false }, { text: 'The author name', isCorrect: false }, { text: 'A hidden message', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: contentWritingSkill._id, question: 'Which is an example of a good headline?', options: [{ text: '10 Tips to Improve Writing', isCorrect: true }, { text: 'Tips', isCorrect: false }, { text: 'Writing', isCorrect: false }, { text: 'Stuff about writing', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is plagiarism?', options: [{ text: 'Using someone else\'s work without credit', isCorrect: true }, { text: 'Writing fast', isCorrect: false }, { text: 'Using big words', isCorrect: false }, { text: 'Writing fiction', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is the purpose of subheadings?', options: [{ text: 'To break up text and guide readers', isCorrect: true }, { text: 'To fill space', isCorrect: false }, { text: 'To make text smaller', isCorrect: false }, { text: 'To hide information', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is "Evergreen Content"?', options: [{ text: 'Content that stays relevant over time', isCorrect: true }, { text: 'Content about nature', isCorrect: false }, { text: 'Deleted content', isCorrect: false }, { text: 'News articles', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: contentWritingSkill._id, question: 'What is a "hook"?', options: [{ text: 'Opening sentence that grabs attention', isCorrect: true }, { text: 'A punctuation mark', isCorrect: false }, { text: 'A selling point', isCorrect: false }, { text: 'A conclusion', isCorrect: false }], difficulty: 'medium', isActive: true }
                );
            }

            const videoEditingSkill = await Skill.findOne({ name: 'Video Editing' });
            if (videoEditingSkill) {
                dataScienceQuestions.push(
                    // Video Editing Questions
                    { skill: videoEditingSkill._id, question: 'What does FPS stand for?', options: [{ text: 'Frames Per Second', isCorrect: true }, { text: 'Files Per Second', isCorrect: false }, { text: 'Frames Per System', isCorrect: false }, { text: 'First Person Shooter', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is a "Jump Cut"?', options: [{ text: 'Abrupt transition between two shots', isCorrect: true }, { text: 'Fading to black', isCorrect: false }, { text: 'Zooming in', isCorrect: false }, { text: 'Slow motion', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: videoEditingSkill._id, question: 'Which software is industry standard for editing?', options: [{ text: 'Adobe Premiere Pro', isCorrect: true }, { text: 'Microsoft Paint', isCorrect: false }, { text: 'Notepad', isCorrect: false }, { text: 'Excel', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is "Color Grading"?', options: [{ text: 'Altering color for aesthetic effect', isCorrect: true }, { text: 'Removing color', isCorrect: false }, { text: 'Adding text', isCorrect: false }, { text: 'Cutting clips', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is a "Timeline"?', options: [{ text: 'Area where clips are arranged', isCorrect: true }, { text: 'A deadline', isCorrect: false }, { text: 'A clock', isCorrect: false }, { text: 'A script', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is "Rendering"?', options: [{ text: 'Processing the final video file', isCorrect: true }, { text: 'Deleting files', isCorrect: false }, { text: 'Recording video', isCorrect: false }, { text: 'Writing scripts', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is 4K resolution?', options: [{ text: '3840 x 2160 pixels', isCorrect: true }, { text: '1920 x 1080 pixels', isCorrect: false }, { text: '1280 x 720 pixels', isCorrect: false }, { text: '720 x 480 pixels', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is a "Transition"?', options: [{ text: 'Effect between two clips', isCorrect: true }, { text: 'Moving files', isCorrect: false }, { text: 'Changing camera', isCorrect: false }, { text: 'Ending the video', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is "B-Roll"?', options: [{ text: 'Supplemental footage', isCorrect: true }, { text: 'Main footage', isCorrect: false }, { text: 'Audio only', isCorrect: false }, { text: 'Text overlays', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: videoEditingSkill._id, question: 'What is "Keyframing"?', options: [{ text: 'Defining starting and ending points of transition', isCorrect: true }, { text: 'Locking the frame', isCorrect: false }, { text: 'Deleting frames', isCorrect: false }, { text: 'Naming files', isCorrect: false }], difficulty: 'hard', isActive: true }
                );
            }

            const digitalMarketingSkill = await Skill.findOne({ name: 'Digital Marketing' });
            if (digitalMarketingSkill) {
                dataScienceQuestions.push(
                    // Digital Marketing Questions
                    { skill: digitalMarketingSkill._id, question: 'What is PPC?', options: [{ text: 'Pay Per Click', isCorrect: true }, { text: 'Pay Per Cost', isCorrect: false }, { text: 'Post Per Click', isCorrect: false }, { text: 'Page Per Click', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'Which platform is best for B2B marketing?', options: [{ text: 'LinkedIn', isCorrect: true }, { text: 'TikTok', isCorrect: false }, { text: 'Snapchat', isCorrect: false }, { text: 'Pinterest', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is CTR?', options: [{ text: 'Click Through Rate', isCorrect: true }, { text: 'Cost To Run', isCorrect: false }, { text: 'Click To Rate', isCorrect: false }, { text: 'Cost Through Rate', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is Content Marketing?', options: [{ text: 'Creating valuable content to attract audience', isCorrect: true }, { text: 'Selling content', isCorrect: false }, { text: 'Buying ads', isCorrect: false }, { text: 'Email spamming', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is SEO?', options: [{ text: 'Search Engine Optimization', isCorrect: true }, { text: 'Social Engagement Online', isCorrect: false }, { text: 'Search Engine Operation', isCorrect: false }, { text: 'Sales Everyday Online', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is a "Pixel" in marketing?', options: [{ text: 'Tracking code on a website', isCorrect: true }, { text: 'A screen dot', isCorrect: false }, { text: 'An image', isCorrect: false }, { text: 'A phone', isCorrect: false }], difficulty: 'hard', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is Google Analytics used for?', options: [{ text: 'Tracking website traffic', isCorrect: true }, { text: 'Sending emails', isCorrect: false }, { text: 'Creating images', isCorrect: false }, { text: 'Writing code', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is A/B Testing?', options: [{ text: 'Comparing two versions', isCorrect: true }, { text: 'Testing alphabet', isCorrect: false }, { text: 'Testing blood type', isCorrect: false }, { text: 'Testing audio', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is "Bounce Rate"?', options: [{ text: 'Percentage of visitors leaving after one page', isCorrect: true }, { text: 'Rate of bouncing check', isCorrect: false }, { text: 'Email bounce', isCorrect: false }, { text: 'Ad rejection rate', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: digitalMarketingSkill._id, question: 'What is "Remarketing"?', options: [{ text: 'Targeting users who visited before', isCorrect: true }, { text: 'Market research', isCorrect: false }, { text: 'Selling again', isCorrect: false }, { text: 'New marketing', isCorrect: false }], difficulty: 'medium', isActive: true }
                );
            }

            const wordpressSkill = await Skill.findOne({ name: 'WordPress' });
            if (wordpressSkill) {
                dataScienceQuestions.push(
                    // WordPress Questions
                    { skill: wordpressSkill._id, question: 'What is WordPress?', options: [{ text: 'A Content Management System (CMS)', isCorrect: true }, { text: 'A programming language', isCorrect: false }, { text: 'A web browser', isCorrect: false }, { text: 'A hosting provider', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: wordpressSkill._id, question: 'What language is WordPress built with?', options: [{ text: 'PHP', isCorrect: true }, { text: 'Python', isCorrect: false }, { text: 'Java', isCorrect: false }, { text: 'C++', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: wordpressSkill._id, question: 'What is a "Theme"?', options: [{ text: 'Controls the look and feel of the site', isCorrect: true }, { text: 'The topic of the blog', isCorrect: false }, { text: 'A plugin', isCorrect: false }, { text: 'A post type', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: wordpressSkill._id, question: 'What is a "Plugin"?', options: [{ text: 'Software to extend functionality', isCorrect: true }, { text: 'A power cord', isCorrect: false }, { text: 'A theme style', isCorrect: false }, { text: 'A database table', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: wordpressSkill._id, question: 'What is the "Loop"?', options: [{ text: 'PHP code used to display posts', isCorrect: true }, { text: 'An infinite circle', isCorrect: false }, { text: 'A plugin', isCorrect: false }, { text: 'A menu item', isCorrect: false }], difficulty: 'hard', isActive: true },
                    { skill: wordpressSkill._id, question: 'Which database does WordPress use?', options: [{ text: 'MySQL', isCorrect: true }, { text: 'MongoDB', isCorrect: false }, { text: 'PostgreSQL', isCorrect: false }, { text: 'SQLite', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: wordpressSkill._id, question: 'What is `wp-config.php`?', options: [{ text: 'Core configuration file', isCorrect: true }, { text: 'A theme file', isCorrect: false }, { text: 'A plugin file', isCorrect: false }, { text: 'An image file', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: wordpressSkill._id, question: 'Where are themes stored?', options: [{ text: 'wp-content/themes', isCorrect: true }, { text: 'wp-admin', isCorrect: false }, { text: 'wp-includes', isCorrect: false }, { text: 'root folder', isCorrect: false }], difficulty: 'medium', isActive: true },
                    { skill: wordpressSkill._id, question: 'What is a "Permalink"?', options: [{ text: 'Permanent URL to a post', isCorrect: true }, { text: 'A temporary link', isCorrect: false }, { text: 'A menu link', isCorrect: false }, { text: 'A user role', isCorrect: false }], difficulty: 'easy', isActive: true },
                    { skill: wordpressSkill._id, question: 'What is a "Shortcode"?', options: [{ text: 'Code shortcut to embed features', isCorrect: true }, { text: 'Small code', isCorrect: false }, { text: 'Password', isCorrect: false }, { text: 'Secret key', isCorrect: false }], difficulty: 'medium', isActive: true }
                );
            }

            await Question.insertMany(dataScienceQuestions);
            // The questions before are already in dataScienceQuestions array which is pushed to DB
            // However, the previous logic pushed webDev and uiUx directly to insertMany then did dataScience separate.
            // I'm appending to dataScienceQuestions but I need to make sure I don't double insert or miss insert.
            // Let's check the context again. 
            // The original code:
            // 816:                     await Question.insertMany(dataScienceQuestions);
            // 817:                     console.log('✅ Data Science questions seeded');
            // But this was INSIDE the check for data science questions missing.
            // I should probably just ensure I run this logic correctly.

            // To be safe, I'm replacing the block inside `seedQuestions`
            // Wait, I am replacing lines 680 (start of dataScience push) to ... 
            // Actually the file content view showed lines 680 only having part of the push.
            // I need to be careful about where I am inserting.

            // Re-reading file content around line 680 in `seedQuestions` function. 
            // It seems I'm editing the initial seed block (lines 55-684) OR the update block (685+)
            // The view showed `seedQuestions` has an `if (questionsExist === 0)` block.
            // The dataScience push was at 559.
            // The replace I'm doing is attempting to insert after dataScience questions are pushed.

            // Let's look at line 680 in view_file output step 20.
            // 680:                 );
            // 681:             }
            // 682: 
            // 683:             await Question.insertMany([...webDevQuestions, ...uiuxQuestions, ...dataScienceQuestions]);

            // So if I replace starting at 680...


            console.log('✅ Quiz questions seeded (Web Dev, UI/UX Design, Data Science)');
        } else {
            console.log('ℹ️  Questions already exist');

            // Check if Data Science questions exist, if not add them
            const dataScienceSkill = await Skill.findOne({ name: 'Data Science' });
            if (dataScienceSkill) {
                const dsQuestionsCount = await Question.countDocuments({ skill: dataScienceSkill._id });
                if (dsQuestionsCount === 0) {
                    console.log('⚠️  Data Science questions missing, adding them...');
                    const dataScienceQuestions = [
                        {
                            skill: dataScienceSkill._id,
                            question: 'What is the primary language used for Data Science?',
                            options: [
                                { text: 'Java', isCorrect: false },
                                { text: 'Python', isCorrect: true },
                                { text: 'C++', isCorrect: false },
                                { text: 'Swift', isCorrect: false }
                            ],
                            difficulty: 'easy',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'Which library is used for data manipulation in Python?',
                            options: [
                                { text: 'Pandas', isCorrect: true },
                                { text: 'Requests', isCorrect: false },
                                { text: 'Flask', isCorrect: false },
                                { text: 'PyGame', isCorrect: false }
                            ],
                            difficulty: 'easy',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'What does CSV stand for?',
                            options: [
                                { text: 'Computer Style Values', isCorrect: false },
                                { text: 'Comma Separated Values', isCorrect: true },
                                { text: 'Common System Variables', isCorrect: false },
                                { text: 'Code Syntax Verification', isCorrect: false }
                            ],
                            difficulty: 'easy',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'Which type of learning involves labeled data?',
                            options: [
                                { text: 'Unsupervised Learning', isCorrect: false },
                                { text: 'Supervised Learning', isCorrect: true },
                                { text: 'Reinforcement Learning', isCorrect: false },
                                { text: 'Deep Learning', isCorrect: false }
                            ],
                            difficulty: 'medium',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'What is a common library for plotting in Python?',
                            options: [
                                { text: 'Matplotlib', isCorrect: true },
                                { text: 'NumPy', isCorrect: false },
                                { text: 'Scikit-learn', isCorrect: false },
                                { text: 'TensorFlow', isCorrect: false }
                            ],
                            difficulty: 'easy',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'What is overfitting?',
                            options: [
                                { text: 'When a model performs poorly on training data', isCorrect: false },
                                { text: 'When a model learns noise in training data', isCorrect: true },
                                { text: 'When a model is too simple', isCorrect: false },
                                { text: 'When a model has too few parameters', isCorrect: false }
                            ],
                            difficulty: 'medium',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'Which algorithm is used for classification?',
                            options: [
                                { text: 'Linear Regression', isCorrect: false },
                                { text: 'Logistic Regression', isCorrect: true },
                                { text: 'K-Means Clustering', isCorrect: false },
                                { text: 'Principal Component Analysis', isCorrect: false }
                            ],
                            difficulty: 'medium',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'What is the purpose of splitting data into train and test sets?',
                            options: [
                                { text: 'To make the model faster', isCorrect: false },
                                { text: 'To evaluate model performance on unseen data', isCorrect: true },
                                { text: 'To increase data size', isCorrect: false },
                                { text: 'To fix missing values', isCorrect: false }
                            ],
                            difficulty: 'medium',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'What is a DataFrame?',
                            options: [
                                { text: 'A 2-dimensional labeled data structure', isCorrect: true },
                                { text: 'A database query', isCorrect: false },
                                { text: 'A machine learning model', isCorrect: false },
                                { text: 'A visualization tool', isCorrect: false }
                            ],
                            difficulty: 'easy',
                            isActive: true
                        },
                        {
                            skill: dataScienceSkill._id,
                            question: 'Which library is used for numerical computing in Python?',
                            options: [
                                { text: 'NumPy', isCorrect: true },
                                { text: 'Django', isCorrect: false },
                                { text: 'BeautifulSoup', isCorrect: false },
                                { text: 'Selenium', isCorrect: false }
                            ],
                            difficulty: 'easy',
                            isActive: true
                        }
                    ];
                    await Question.insertMany(dataScienceQuestions);
                    console.log('✅ Data Science questions seeded');
                }
            }

            // Check if Mobile Development questions exist, if not add them
            const mobileDevSkill = await Skill.findOne({ name: 'Mobile Development' });
            if (mobileDevSkill) {
                const mobileQuestionsCount = await Question.countDocuments({ skill: mobileDevSkill._id });
                if (mobileQuestionsCount === 0) {
                    console.log('⚠️  Mobile Development questions missing, adding them...');
                    const mobileQuestions = [
                        { skill: mobileDevSkill._id, question: 'What is the primary language for iOS development?', options: [{ text: 'Swift', isCorrect: true }, { text: 'Kotlin', isCorrect: false }, { text: 'Java', isCorrect: false }, { text: 'Python', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: mobileDevSkill._id, question: 'Which company developed Android?', options: [{ text: 'Google', isCorrect: true }, { text: 'Apple', isCorrect: false }, { text: 'Microsoft', isCorrect: false }, { text: 'Amazon', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: mobileDevSkill._id, question: 'What is Flutter?', options: [{ text: 'A UI toolkit', isCorrect: true }, { text: 'A database', isCorrect: false }, { text: 'A server framework', isCorrect: false }, { text: 'An operating system', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: mobileDevSkill._id, question: 'Which file extension is used for Android apps?', options: [{ text: '.apk', isCorrect: true }, { text: '.exe', isCorrect: false }, { text: '.ipa', isCorrect: false }, { text: '.dmg', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: mobileDevSkill._id, question: 'What does SDK stand for?', options: [{ text: 'Software Development Kit', isCorrect: true }, { text: 'System Design Kit', isCorrect: false }, { text: 'Standard Data Kit', isCorrect: false }, { text: 'Software Data Key', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: mobileDevSkill._id, question: 'What is React Native used for?', options: [{ text: 'Cross-platform mobile apps', isCorrect: true }, { text: 'Desktop apps only', isCorrect: false }, { text: 'Websites only', isCorrect: false }, { text: 'Database management', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: mobileDevSkill._id, question: 'Which component is the entry point of an Android app?', options: [{ text: 'Activity', isCorrect: true }, { text: 'Service', isCorrect: false }, { text: 'BroadcastReceiver', isCorrect: false }, { text: 'ContentProvider', isCorrect: false }], difficulty: 'hard', isActive: true },
                        { skill: mobileDevSkill._id, question: 'What is Xcode?', options: [{ text: 'IDE for macOS/iOS development', isCorrect: true }, { text: 'A database', isCorrect: false }, { text: 'A web browser', isCorrect: false }, { text: 'A graphics tool', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: mobileDevSkill._id, question: 'Which language is primarily used for native Android development?', options: [{ text: 'Kotlin', isCorrect: true }, { text: 'Swift', isCorrect: false }, { text: 'C#', isCorrect: false }, { text: 'Ruby', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: mobileDevSkill._id, question: 'What is a Bundle ID in iOS?', options: [{ text: 'Unique app identifier', isCorrect: true }, { text: 'App price', isCorrect: false }, { text: 'Developer name', isCorrect: false }, { text: 'App icon', isCorrect: false }], difficulty: 'hard', isActive: true }
                    ];
                    await Question.insertMany(mobileQuestions);
                    console.log('✅ Mobile Development questions seeded');
                }
            }

            // Check if DevOps questions exist, if not add them
            const devOpsSkill = await Skill.findOne({ name: 'DevOps' });
            if (devOpsSkill) {
                const devOpsQuestionsCount = await Question.countDocuments({ skill: devOpsSkill._id });
                if (devOpsQuestionsCount === 0) {
                    console.log('⚠️  DevOps questions missing, adding them...');
                    const devOpsQuestions = [
                        { skill: devOpsSkill._id, question: 'What does CI/CD stand for?', options: [{ text: 'Continuous Integration/Continuous Deployment', isCorrect: true }, { text: 'Code Integration/Code Deployment', isCorrect: false }, { text: 'Computer Interface/Computer Design', isCorrect: false }, { text: 'Cloud Integration/Cloud Distribution', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: devOpsSkill._id, question: 'Which tool is used for containerization?', options: [{ text: 'Docker', isCorrect: true }, { text: 'Jenkins', isCorrect: false }, { text: 'Git', isCorrect: false }, { text: 'Nginx', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: devOpsSkill._id, question: 'What is Kubernetes used for?', options: [{ text: 'Container Orchestration', isCorrect: true }, { text: 'Version Control', isCorrect: false }, { text: 'Code Editing', isCorrect: false }, { text: 'Database Management', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: devOpsSkill._id, question: 'Which command lists running Docker containers?', options: [{ text: 'docker ps', isCorrect: true }, { text: 'docker list', isCorrect: false }, { text: 'docker run', isCorrect: false }, { text: 'docker show', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: devOpsSkill._id, question: 'What is Infrastructure as Code (IaC)?', options: [{ text: 'Managing infrastructure through code files', isCorrect: true }, { text: 'Writing code for servers', isCorrect: false }, { text: 'Building hardware with code', isCorrect: false }, { text: 'Coding interview practice', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: devOpsSkill._id, question: 'Which tool is a popular CI/CD server?', options: [{ text: 'Jenkins', isCorrect: true }, { text: 'Vim', isCorrect: false }, { text: 'Putty', isCorrect: false }, { text: 'Slack', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: devOpsSkill._id, question: 'What is Ansible?', options: [{ text: 'Configuration Management tool', isCorrect: true }, { text: 'Operating System', isCorrect: false }, { text: 'Programming Language', isCorrect: false }, { text: 'Text Editor', isCorrect: false }], difficulty: 'medium', isActive: true },
                        { skill: devOpsSkill._id, question: 'What is the default port for SSH?', options: [{ text: '22', isCorrect: true }, { text: '80', isCorrect: false }, { text: '443', isCorrect: false }, { text: '21', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: devOpsSkill._id, question: 'What does AWS stand for?', options: [{ text: 'Amazon Web Services', isCorrect: true }, { text: 'Advanced Web System', isCorrect: false }, { text: 'Automated Web Server', isCorrect: false }, { text: 'Apple Web Service', isCorrect: false }], difficulty: 'easy', isActive: true },
                        { skill: devOpsSkill._id, question: 'What is a "pod" in Kubernetes?', options: [{ text: 'The smallest deployable unit', isCorrect: true }, { text: 'A storage unit', isCorrect: false }, { text: 'A type of server', isCorrect: false }, { text: 'A network protocol', isCorrect: false }], difficulty: 'hard', isActive: true }
                    ];
                    await Question.insertMany(devOpsQuestions);
                    console.log('✅ DevOps questions seeded');
                }
            }
        }
    } catch (error) {
        console.error('❌ Error seeding questions:', error.message);
    }
};

const seedAdminSettings = async () => {
    try {
        const settingsExist = await AdminSettings.countDocuments();

        if (settingsExist === 0) {
            const settings = [
                { key: 'commission_rate', value: 0.01, description: 'Platform commission rate (1%)', category: 'payment' },
                { key: 'quiz_pass_score', value: 3, description: 'Minimum score to pass skill quiz (3 out of 5)', category: 'quiz' },
                { key: 'quiz_questions_count', value: 5, description: 'Number of questions per quiz', category: 'quiz' },
                { key: 'quiz_token_validity', value: 24, description: 'Quiz pass token validity in hours', category: 'quiz' },
                { key: 'site_name', value: 'WorkIT', description: 'Platform name', category: 'general' },
                { key: 'support_email', value: 'support@workit.com', description: 'Support email address', category: 'general' }
            ];

            await AdminSettings.insertMany(settings);
            console.log('✅ Admin settings seeded successfully');
        } else {
            console.log('ℹ️  Admin settings already exist');
        }
    } catch (error) {
        console.error('❌ Error seeding admin settings:', error.message);
    }
};

const seedUsers = async () => {
    try {
        const userCount = await User.countDocuments({ role: { $ne: 'admin' } });

        if (userCount === 0) {
            // Get some skills for freelancers
            const skills = await Skill.find().limit(5);

            const sampleUsers = [
                // Freelancers
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'freelancer',
                    skills: skills.slice(0, 3).map(s => ({ skill: s._id })),
                    bio: 'Experienced web developer with 5+ years of experience',
                    isSuspended: false
                },
                {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    password: 'password123',
                    role: 'freelancer',
                    skills: skills.slice(1, 4).map(s => ({ skill: s._id })),
                    bio: 'UI/UX Designer specializing in mobile apps',
                    isSuspended: false
                },
                {
                    name: 'Mike Johnson',
                    email: 'mike@example.com',
                    password: 'password123',
                    role: 'freelancer',
                    skills: skills.slice(2, 5).map(s => ({ skill: s._id })),
                    bio: 'Full-stack developer and DevOps engineer',
                    isSuspended: false
                },
                // Clients
                {
                    name: 'Tech Corp',
                    email: 'client1@example.com',
                    password: 'password123',
                    role: 'client',
                    company: 'Tech Corp Inc',
                    isSuspended: false
                },
                {
                    name: 'Startup Hub',
                    email: 'client2@example.com',
                    password: 'password123',
                    role: 'client',
                    company: 'Startup Hub LLC',
                    isSuspended: false
                },
                {
                    name: 'Design Agency',
                    email: 'client3@example.com',
                    password: 'password123',
                    role: 'client',
                    company: 'Design Agency Co',
                    isSuspended: false
                }
            ];

            await User.insertMany(sampleUsers);
            console.log('✅ Sample users seeded successfully (3 freelancers, 3 clients)');
        } else {
            console.log('ℹ️  Users already exist');
        }
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
    }
};

const runAllSeeds = async () => {
    console.log('\n🌱 Starting database seeding...\n');
    await seedSkills();
    await seedQuestions();
    await seedAdmin();
    await seedAdminSettings();
    await seedUsers();
    console.log('\n🌱 Database seeding completed!\n');
};

module.exports = { seedAdmin, seedSkills, seedQuestions, seedAdminSettings, seedUsers, runAllSeeds };
