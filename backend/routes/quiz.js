const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getSkills,
    startQuiz,
    submitQuiz,
    getAttempts,
    addSkill,
    getQuizResults,
    checkCooldown,
    getSkillCourses
} = require('../controllers/quizController');

// @route   GET /api/quiz/skills
// @desc    Get all active skills for quiz selection
// @access  Public
router.get('/skills', getSkills);

// @route   POST /api/quiz/check-cooldown
// @desc    Check if user is in cooldown period
// @access  Public
router.post('/check-cooldown', checkCooldown);

// @route   GET /api/quiz/skill-courses/:skillId
// @desc    Get course links for a skill
// @access  Public
router.get('/skill-courses/:skillId', getSkillCourses);

// @route   POST /api/quiz/start
// @desc    Start a quiz - get randomized questions
// @access  Public
router.post('/start', startQuiz);

// @route   POST /api/quiz/submit
// @desc    Submit quiz answers
// @access  Public
router.post('/submit', submitQuiz);

// @route   GET /api/quiz/attempts
// @desc    Get quiz attempts for current user (freelancer)
// @access  Private (Freelancer)
router.get('/attempts', protect, authorize('freelancer'), getAttempts);

// @route   POST /api/quiz/add-skill
// @desc    Take quiz for additional skill (existing freelancer)
// @access  Private (Freelancer)
router.post('/add-skill', protect, authorize('freelancer'), addSkill);

// @route   GET /api/quiz/results/:attemptId
// @desc    Get detailed quiz results
// @access  Private
router.get('/results/:attemptId', protect, getQuizResults);

module.exports = router;
