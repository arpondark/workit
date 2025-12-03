const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { paginate, paginationResponse } = require('../utils/helpers');

// @desc    Get all chats for current user
// @route   GET /api/chat
// @access  Private
exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
            isActive: true
        })
            .populate('participants', 'name avatar isOnline lastSeen')
            .populate('job', 'title status')
            .populate({
                path: 'lastMessage',
                select: 'content type createdAt sender isRead'
            })
            .sort('-lastMessageAt');

        // Add unread count for current user
        const chatsWithUnread = chats.map(chat => {
            const chatObj = chat.toObject();
            chatObj.unreadCount = chat.unreadCount.get(req.user._id.toString()) || 0;
            return chatObj;
        });

        res.json({
            success: true,
            count: chats.length,
            chats: chatsWithUnread
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single chat with messages
// @route   GET /api/chat/:chatId
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('participants', 'name avatar isOnline lastSeen role')
            .populate('job', 'title status budget');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Verify user is participant
        const isParticipant = chat.participants.some(
            p => p._id.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        res.json({
            success: true,
            chat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Verify user is participant
        const isParticipant = chat.participants.some(
            p => p.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        const { skip, limit: limitNum } = paginate(page, limit);

        const messages = await Message.find({
            chat: req.params.chatId,
            isDeleted: false
        })
            .populate('sender', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Message.countDocuments({
            chat: req.params.chatId,
            isDeleted: false
        });

        // Mark messages as read
        await Message.updateMany(
            {
                chat: req.params.chatId,
                sender: { $ne: req.user._id },
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        // Reset unread count
        chat.unreadCount.set(req.user._id.toString(), 0);
        await chat.save();

        res.json({
            success: true,
            ...paginationResponse(messages.reverse(), page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send a message
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { content, type = 'text' } = req.body;

        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Verify user is participant
        const isParticipant = chat.participants.some(
            p => p.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this chat'
            });
        }

        // Create message
        const message = await Message.create({
            chat: req.params.chatId,
            sender: req.user._id,
            content,
            type
        });

        // Update chat
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();

        // Increment unread count for other participant
        chat.participants.forEach(p => {
            if (p.toString() !== req.user._id.toString()) {
                const currentCount = chat.unreadCount.get(p.toString()) || 0;
                chat.unreadCount.set(p.toString(), currentCount + 1);
            }
        });

        await chat.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar');

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Start a new chat or get existing
// @route   POST /api/chat/start
// @access  Private
exports.startChat = async (req, res) => {
    try {
        const { userId, jobId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if other user exists
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for existing chat
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, userId] }
        })
            .populate('participants', 'name avatar isOnline lastSeen')
            .populate('job', 'title status');

        if (chat) {
            return res.json({
                success: true,
                chat,
                existing: true
            });
        }

        // Create new chat
        chat = await Chat.create({
            participants: [req.user._id, userId],
            job: jobId || null
        });

        chat = await Chat.findById(chat._id)
            .populate('participants', 'name avatar isOnline lastSeen')
            .populate('job', 'title status');

        res.status(201).json({
            success: true,
            chat,
            existing: false
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark all messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
exports.markRead = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Verify user is participant
        const isParticipant = chat.participants.some(
            p => p.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Mark messages as read
        await Message.updateMany(
            {
                chat: req.params.chatId,
                sender: { $ne: req.user._id },
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        // Reset unread count
        chat.unreadCount.set(req.user._id.toString(), 0);
        await chat.save();

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
