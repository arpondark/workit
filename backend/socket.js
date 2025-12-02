const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const setupSocket = (io) => {
    // Store connected users
    const connectedUsers = new Map();

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('User not found'));
            }

            if (user.isSuspended) {
                return next(new Error('Account suspended'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.user._id.toString();
        
        console.log(`User connected: ${socket.user.name} (${userId})`);

        // Store user's socket
        connectedUsers.set(userId, socket.id);

        // Update user online status
        await User.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: new Date()
        });

        // Broadcast user online status
        socket.broadcast.emit('user:online', { userId });

        // Join user's chat rooms
        const userChats = await Chat.find({ participants: userId });
        userChats.forEach(chat => {
            socket.join(`chat:${chat._id}`);
        });

        // ==================== CHAT EVENTS ====================

        // Join a specific chat room
        socket.on('chat:join', async (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`${socket.user.name} joined chat: ${chatId}`);
        });

        // Leave a chat room
        socket.on('chat:leave', (chatId) => {
            socket.leave(`chat:${chatId}`);
        });

        // Send message
        socket.on('message:send', async (data) => {
            try {
                const { chatId, content, type = 'text' } = data;

                // Verify user is participant
                const chat = await Chat.findById(chatId);
                if (!chat || !chat.participants.includes(userId)) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                // Create message
                const message = await Message.create({
                    chat: chatId,
                    sender: userId,
                    content,
                    type
                });

                // Update chat
                chat.lastMessage = message._id;
                chat.lastMessageAt = new Date();

                // Increment unread count for other participant
                chat.participants.forEach(p => {
                    const participantId = p.toString();
                    if (participantId !== userId) {
                        const currentCount = chat.unreadCount.get(participantId) || 0;
                        chat.unreadCount.set(participantId, currentCount + 1);
                    }
                });

                await chat.save();

                // Populate message
                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'name avatar');

                // Emit to chat room
                io.to(`chat:${chatId}`).emit('message:received', {
                    chatId,
                    message: populatedMessage
                });

                // Send notification to offline users
                chat.participants.forEach(p => {
                    const participantId = p.toString();
                    if (participantId !== userId) {
                        const recipientSocket = connectedUsers.get(participantId);
                        if (recipientSocket) {
                            io.to(recipientSocket).emit('notification:message', {
                                chatId,
                                message: populatedMessage,
                                sender: socket.user.name
                            });
                        }
                    }
                });

            } catch (error) {
                console.error('Message send error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Mark messages as read
        socket.on('message:read', async (data) => {
            try {
                const { chatId } = data;

                // Update messages
                await Message.updateMany(
                    {
                        chat: chatId,
                        sender: { $ne: userId },
                        isRead: false
                    },
                    {
                        isRead: true,
                        readAt: new Date()
                    }
                );

                // Reset unread count
                const chat = await Chat.findById(chatId);
                if (chat) {
                    chat.unreadCount.set(userId, 0);
                    await chat.save();
                }

                // Notify sender that messages were read
                io.to(`chat:${chatId}`).emit('message:seen', {
                    chatId,
                    readBy: userId
                });

            } catch (error) {
                console.error('Message read error:', error);
            }
        });

        // Typing indicator
        socket.on('typing:start', (data) => {
            const { chatId } = data;
            socket.to(`chat:${chatId}`).emit('typing:update', {
                chatId,
                userId,
                userName: socket.user.name,
                isTyping: true
            });
        });

        socket.on('typing:stop', (data) => {
            const { chatId } = data;
            socket.to(`chat:${chatId}`).emit('typing:update', {
                chatId,
                userId,
                userName: socket.user.name,
                isTyping: false
            });
        });

        // ==================== NOTIFICATION EVENTS ====================

        // Send notification to specific user
        socket.on('notification:send', (data) => {
            const { recipientId, notification } = data;
            const recipientSocket = connectedUsers.get(recipientId);
            
            if (recipientSocket) {
                io.to(recipientSocket).emit('notification:received', notification);
            }
        });

        // ==================== DISCONNECT ====================

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.name}`);

            // Remove from connected users
            connectedUsers.delete(userId);

            // Update user offline status
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date()
            });

            // Broadcast user offline status
            socket.broadcast.emit('user:offline', { 
                userId,
                lastSeen: new Date()
            });
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    // Utility function to get online status
    io.getOnlineUsers = () => {
        return Array.from(connectedUsers.keys());
    };

    // Utility function to check if user is online
    io.isUserOnline = (userId) => {
        return connectedUsers.has(userId);
    };

    // Utility function to send notification to user
    io.notifyUser = (userId, event, data) => {
        const socketId = connectedUsers.get(userId);
        if (socketId) {
            io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    };

    return io;
};

module.exports = setupSocket;
