const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Skill = require('../models/Skill');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const AdminSettings = require('../models/AdminSettings');
const { protect, authorize } = require('../middleware/auth');
const { generateQuizPassToken } = require('../utils/helpers');

// @route   GET /api/quiz/skills
// @desc    Get all active skills for quiz selection
// @access  Public
router.get('/skills', async (req, res) => {
    try {
        const skills = await Skill.find({ isActive: true })
            .select('name slug icon description category')
            .sort('name');

        res.json({
            success: true,
            count: skills.length,
            skills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quiz/start
// @desc    Start a quiz - get randomized questions
// @access  Public
router.post('/start', async (req, res) => {
    try {
        const { skillId, email } = req.body;

        if (!skillId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Skill ID and email are required'
            });
        }

        // Check if skill exists
        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account already exists with this email. Please login instead.'
            });
        }

        // Get quiz settings
        const questionsCountSetting = await AdminSettings.findOne({ key: 'quiz_questions_count' });
        const questionsCount = questionsCountSetting ? questionsCountSetting.value : 10;

        // Get random questions for this skill
        const questions = await Question.aggregate([
            { $match: { skill: skill._id, isActive: true } },
            { $sample: { size: questionsCount } },
            {
                $project: {
                    question: 1,
                    options: {
                        $map: {
                            input: '$options',
                            as: 'opt',
                            in: { text: '$$opt.text' } // Don't send isCorrect
                        }
                    },
                    difficulty: 1
                }
            }
        ]);

        if (questions.length < questionsCount) {
            return res.status(400).json({
                success: false,
                message: `Not enough questions available for ${skill.name}. Please try another skill.`
            });
        }

        // Create a quiz session token
        const quizSessionId = generateQuizPassToken();

        res.json({
            success: true,
            quizSessionId,
            skill: {
                _id: skill._id,
                name: skill.name,
                icon: skill.icon
            },
            questionsCount: questions.length,
            questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quiz/submit
// @desc    Submit quiz answers
// @access  Public
router.post('/submit', async (req, res) => {
    try {
        const { skillId, email, answers, timeTaken } = req.body;

        if (!skillId || !email || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Skill ID, email, and answers are required'
            });
        }

        // Get quiz settings
        const passScoreSetting = await AdminSettings.findOne({ key: 'quiz_pass_score' });
        const tokenValiditySetting = await AdminSettings.findOne({ key: 'quiz_token_validity' });
        const passScore = passScoreSetting ? passScoreSetting.value : 7;
        const tokenValidityHours = tokenValiditySetting ? tokenValiditySetting.value : 24;

        // Calculate score
        let correctCount = 0;
        const questionResults = [];

        for (const answer of answers) {
            const question = await Question.findById(answer.questionId);
            if (question) {
                const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
                const isCorrect = answer.selectedOption === correctOptionIndex;
                
                if (isCorrect) correctCount++;

                questionResults.push({
                    question: question._id,
                    selectedOption: answer.selectedOption,
                    isCorrect
                });
            }
        }

        const score = correctCount;
        const passed = score >= passScore;

        // Create quiz attempt record
        const quizAttemptData = {
            email: email.toLowerCase(),
            skill: skillId,
            questions: questionResults,
            score,
            totalQuestions: answers.length,
            passed,
            timeTaken: timeTaken || 0,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        };

        // If passed, generate pass token
        if (passed) {
            const passToken = generateQuizPassToken();
            quizAttemptData.passToken = passToken;
            quizAttemptData.passTokenExpiresAt = new Date(Date.now() + tokenValidityHours * 60 * 60 * 1000);
        }

        const quizAttempt = await QuizAttempt.create(quizAttemptData);

        // Get skill info
        const skill = await Skill.findById(skillId);

        // Prepare response
        const response = {
            success: true,
            score,
            totalQuestions: answers.length,
            passed,
            passScore,
            skillId: skill._id,
            skill: {
                _id: skill._id,
                name: skill.name
            }
        };

        if (passed) {
            response.message = 'Congratulations! You passed the quiz!';
            response.passToken = quizAttempt.passToken;
            response.quizPassToken = quizAttempt.passToken; // For backward compatibility
            response.tokenExpiresAt = quizAttempt.passTokenExpiresAt;
        } else {
            response.message = `You scored ${score}/${answers.length}. You need at least ${passScore} to pass.`;
            response.suggestCourse = true;
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/quiz/attempts
// @desc    Get quiz attempts for current user (freelancer)
// @access  Private (Freelancer)
router.get('/attempts', protect, authorize('freelancer'), async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ 
            email: req.user.email 
        })
        .populate('skill', 'name icon')
        .sort('-createdAt');

        res.json({
            success: true,
            count: attempts.length,
            attempts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/quiz/add-skill
// @desc    Take quiz for additional skill (existing freelancer)
// @access  Private (Freelancer)
router.post('/add-skill', protect, authorize('freelancer'), async (req, res) => {
    try {
        const { skillId, answers, timeTaken } = req.body;

        // Check if freelancer already has this skill
        const hasSkill = req.user.skills.some(s => s.skill.toString() === skillId);
        if (hasSkill) {
            return res.status(400).json({
                success: false,
                message: 'You already have this skill verified'
            });
        }

        // Get quiz settings
        const passScoreSetting = await AdminSettings.findOne({ key: 'quiz_pass_score' });
        const passScore = passScoreSetting ? passScoreSetting.value : 7;

        // Calculate score
        let correctCount = 0;
        const questionResults = [];

        for (const answer of answers) {
            const question = await Question.findById(answer.questionId);
            if (question) {
                const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
                const isCorrect = answer.selectedOption === correctOptionIndex;
                
                if (isCorrect) correctCount++;

                questionResults.push({
                    question: question._id,
                    selectedOption: answer.selectedOption,
                    isCorrect
                });
            }
        }

        const score = correctCount;
        const passed = score >= passScore;

        // Record attempt
        await QuizAttempt.create({
            email: req.user.email,
            skill: skillId,
            questions: questionResults,
            score,
            totalQuestions: answers.length,
            passed,
            timeTaken: timeTaken || 0
        });

        if (passed) {
            // Add skill to user
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    skills: {
                        skill: skillId,
                        quizScore: score,
                        passed: true,
                        passedAt: new Date()
                    }
                }
            });

            // Increment freelancer count for skill
            await Skill.findByIdAndUpdate(skillId, {
                $inc: { freelancerCount: 1 }
            });

            const skill = await Skill.findById(skillId);

            res.json({
                success: true,
                passed: true,
                score,
                message: `Congratulations! You've added ${skill.name} to your skills!`
            });
        } else {
            res.json({
                success: true,
                passed: false,
                score,
                passScore,
                message: `You scored ${score}/${answers.length}. You need at least ${passScore} to add this skill.`,
                suggestCourse: true
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/quiz/results/:attemptId
// @desc    Get detailed quiz results
// @access  Private
router.get('/results/:attemptId', protect, async (req, res) => {
    try {
        const attempt = await QuizAttempt.findById(req.params.attemptId)
            .populate('skill', 'name icon')
            .populate('questions.question', 'question options explanation');

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Quiz attempt not found'
            });
        }

        // Only allow user to see their own results (or admin)
        if (attempt.email !== req.user.email && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these results'
            });
        }

        res.json({
            success: true,
            attempt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
