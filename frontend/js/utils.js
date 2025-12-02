// API Configuration
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// API Helper
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    },

    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Auth Helper
const auth = {
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    login(token, user) {
        this.setToken(token);
        this.setUser(user);
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    async checkAuth() {
        if (!this.isLoggedIn()) {
            return null;
        }

        try {
            const data = await api.get('/auth/me');
            this.setUser(data.user);
            return data.user;
        } catch (error) {
            this.logout();
            return null;
        }
    },

    requireAuth(allowedRoles = []) {
        const user = this.getUser();
        
        if (!this.isLoggedIn() || !user) {
            window.location.href = '/pages/auth/login.html';
            return false;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            window.location.href = '/';
            return false;
        }

        return true;
    }
};

// Toast Notifications
const toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 3000) {
        this.init();

        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toastEl.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        this.container.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toastEl.remove(), 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    warning(message) {
        this.show(message, 'warning');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// Loading Overlay
const loading = {
    overlay: null,

    show(message = 'Loading...') {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'loading-overlay';
            this.overlay.innerHTML = `
                <div class="spinner"></div>
                <p>${message}</p>
            `;
        }
        document.body.appendChild(this.overlay);
    },

    hide() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.remove();
        }
    }
};

// Modal Helper
const modal = {
    show(options) {
        const { title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' } = options;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                    <button class="btn btn-primary modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => overlay.classList.add('active'));

        // Event handlers
        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('.modal-close').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        overlay.querySelector('.modal-cancel').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        overlay.querySelector('.modal-confirm').addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                if (onCancel) onCancel();
            }
        });

        return { close: closeModal };
    },

    confirm(message, onConfirm) {
        return this.show({
            title: 'Confirm',
            content: `<p>${message}</p>`,
            onConfirm
        });
    },

    alert(title, message) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary modal-ok">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('.modal-close').addEventListener('click', closeModal);
        overlay.querySelector('.modal-ok').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }
};

// Utility Functions
const utils = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    },

    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    generateAvatar(name) {
        const initials = this.getInitials(name);
        return `<div class="avatar">${initials}</div>`;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    renderStars(rating, max = 5) {
        let stars = '';
        for (let i = 1; i <= max; i++) {
            stars += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
        }
        return stars;
    },

    getStatusBadge(status) {
        const statusMap = {
            'open': { class: 'badge-success', text: 'Open' },
            'in-progress': { class: 'badge-primary', text: 'In Progress' },
            'completed': { class: 'badge-gray', text: 'Completed' },
            'cancelled': { class: 'badge-danger', text: 'Cancelled' },
            'pending': { class: 'badge-warning', text: 'Pending' },
            'accepted': { class: 'badge-success', text: 'Accepted' },
            'rejected': { class: 'badge-danger', text: 'Rejected' },
            'shortlisted': { class: 'badge-primary', text: 'Shortlisted' },
            'withdrawn': { class: 'badge-gray', text: 'Withdrawn' }
        };

        const statusInfo = statusMap[status] || { class: 'badge-gray', text: status };
        return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
    },

    getBudgetLabel(budget) {
        if (!budget) return 'Budget not specified';
        if (budget.type === 'hourly') {
            return `${this.formatCurrency(budget.min)} - ${this.formatCurrency(budget.max)}/hr`;
        }
        return `${this.formatCurrency(budget.min)} - ${this.formatCurrency(budget.max)}`;
    },

    getDurationLabel(duration) {
        const durationMap = {
            'less-than-week': 'Less than a week',
            '1-2-weeks': '1-2 weeks',
            '2-4-weeks': '2-4 weeks',
            '1-3-months': '1-3 months',
            '3-6-months': '3-6 months',
            'more-than-6-months': 'More than 6 months'
        };
        return durationMap[duration] || duration;
    },

    getExperienceLabel(level) {
        const levelMap = {
            'entry': 'Entry Level',
            'intermediate': 'Intermediate',
            'expert': 'Expert'
        };
        return levelMap[level] || level;
    }
};

// Form Validation
const validate = {
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    password(password) {
        return password.length >= 6;
    },

    required(value) {
        return value && value.trim().length > 0;
    },

    minLength(value, min) {
        return value && value.length >= min;
    },

    maxLength(value, max) {
        return value && value.length <= max;
    },

    number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    positiveNumber(value) {
        return this.number(value) && parseFloat(value) > 0;
    }
};

// URL Helper
const url = {
    getParams() {
        return new URLSearchParams(window.location.search);
    },

    getParam(name) {
        return this.getParams().get(name);
    },

    setParams(params) {
        const searchParams = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.set(key, value);
            } else {
                searchParams.delete(key);
            }
        });
        window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`);
    }
};

// Export for use in other files
window.api = api;
window.auth = auth;
window.toast = toast;
window.loading = loading;
window.modal = modal;
window.utils = utils;
window.validate = validate;
window.url = url;
