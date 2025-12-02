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

            await Question.insertMany([...webDevQuestions, ...uiuxQuestions]);
            console.log('✅ Quiz questions seeded (20 Web Dev + 20 UI/UX Design)');
        } else {
            console.log('ℹ️  Questions already exist');
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
                { key: 'quiz_pass_score', value: 7, description: 'Minimum score to pass skill quiz', category: 'quiz' },
                { key: 'quiz_questions_count', value: 10, description: 'Number of questions per quiz', category: 'quiz' },
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

const runAllSeeds = async () => {
    console.log('\n🌱 Starting database seeding...\n');
    await seedSkills();
    await seedQuestions();
    await seedAdmin();
    await seedAdminSettings();
    console.log('\n🌱 Database seeding completed!\n');
};

module.exports = { seedAdmin, seedSkills, seedQuestions, seedAdminSettings, runAllSeeds };
