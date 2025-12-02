// Socket.IO Client Handler
class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }

    connect() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('No token found, skipping socket connection');
            return;
        }

        if (this.socket && this.connected) {
            console.log('Socket already connected');
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.connected = false;
            this.emit('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('Max reconnection attempts reached');
                this.socket.disconnect();
            }
        });

        // User status events
        this.socket.on('user:online', (data) => {
            this.emit('userOnline', data);
        });

        this.socket.on('user:offline', (data) => {
            this.emit('userOffline', data);
        });

        // Message events
        this.socket.on('message:received', (data) => {
            this.emit('messageReceived', data);
        });

        this.socket.on('message:seen', (data) => {
            this.emit('messageSeen', data);
        });

        // Typing events
        this.socket.on('typing:update', (data) => {
            this.emit('typingUpdate', data);
        });

        // Notification events
        this.socket.on('notification:message', (data) => {
            this.emit('newMessageNotification', data);
            this.showNotification(data);
        });

        this.socket.on('notification:received', (data) => {
            this.emit('notification', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error(error.message || 'Connection error');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    // Join a chat room
    joinChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('chat:join', chatId);
        }
    }

    // Leave a chat room
    leaveChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('chat:leave', chatId);
        }
    }

    // Send a message
    sendMessage(chatId, content, type = 'text') {
        if (this.socket && this.connected) {
            this.socket.emit('message:send', { chatId, content, type });
        }
    }

    // Mark messages as read
    markAsRead(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('message:read', { chatId });
        }
    }

    // Start typing
    startTyping(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('typing:start', { chatId });
        }
    }

    // Stop typing
    stopTyping(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('typing:stop', { chatId });
        }
    }

    // Event emitter methods
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    // Show browser notification
    showNotification(data) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            this.createNotification(data);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.createNotification(data);
                }
            });
        }
    }

    createNotification(data) {
        const notification = new Notification('New Message - WorkIT', {
            body: `${data.sender}: ${data.message.content.substring(0, 50)}...`,
            icon: '/img/logo.png',
            tag: data.chatId
        });

        notification.onclick = () => {
            window.focus();
            window.location.href = `/pages/${auth.getUser().role}/chat.html?chat=${data.chatId}`;
        };

        setTimeout(() => notification.close(), 5000);
    }

    // Check if connected
    isConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Create global instance
window.socketClient = new SocketClient();

// Auto-connect when page loads if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    if (auth.isLoggedIn()) {
        socketClient.connect();
    }
});
