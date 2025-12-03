const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getChats,
    getChat,
    getMessages,
    sendMessage,
    startChat,
    markRead
} = require('../controllers/chatController');

// @route   GET /api/chat
// @desc    Get all chats for current user
// @access  Private
router.get('/', protect, getChats);

// @route   POST /api/chat/start
// @desc    Start a new chat or get existing
// @access  Private
router.post('/start', protect, startChat);

// @route   GET /api/chat/:chatId
// @desc    Get single chat with messages
// @access  Private
router.get('/:chatId', protect, getChat);

// @route   GET /api/chat/:chatId/messages
// @desc    Get messages for a chat
// @access  Private
router.get('/:chatId/messages', protect, getMessages);

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message
// @access  Private
router.post('/:chatId/messages', protect, sendMessage);

// @route   PUT /api/chat/:chatId/read
// @desc    Mark all messages as read
// @access  Private
router.put('/:chatId/read', protect, markRead);

module.exports = router;
