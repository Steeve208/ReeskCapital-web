/**
 * RSC Admin Authentication Manager
 * Handles admin authentication, session management, and API integration
 */

class AdminAuthManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:4000';
        this.token = null;
        this.user = null;
        this.init();
    }

    init() {
        // Load stored session
        this.loadStoredSession();

        // Check if we're on the admin dashboard and need authentication
        if (window.location.pathname.includes('/admin/index.html')) {
            this.checkAuthentication();
        }
    }

    loadStoredSession() {
        try {
            const token = localStorage.getItem('rsc_admin_token');
            const userData = localStorage.getItem('rsc_admin_user');

            if (token && userData) {
                this.token = token;
                this.user = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading stored session:', error);
            this.clearSession();
        }
    }

    saveSession(token, user) {
        this.token = token;
        this.user = user;

        localStorage.setItem('rsc_admin_token', token);
        localStorage.setItem('rsc_admin_user', JSON.stringify(user));
    }

    clearSession() {
        this.token = null;
        this.user = null;

        localStorage.removeItem('rsc_admin_token');
        localStorage.removeItem('rsc_admin_user');
    }

    checkAuthentication() {
        if (!this.isAuthenticated()) {
            console.log('No admin session found, redirecting to login');
            window.location.href = '../admin-login.html';
            return false;
        }

        // Verify token is still valid
        this.verifyToken();
        return true;
    }

    isAuthenticated() {
        return !!(this.token && this.user);
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                return true;
            } else if (response.status === 401) {
                console.log('Token expired, clearing session');
                this.clearSession();
                window.location.href = '../admin-login.html';
                return false;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }

        return false;
    }

    async makeAuthenticatedRequest(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, mergedOptions);

        if (response.status === 401) {
            this.clearSession();
            window.location.href = '../admin-login.html';
            throw new Error('Session expired');
        }

        return response;
    }

    logout() {
        this.clearSession();
        window.location.href = '../admin-login.html';
    }

    // Utility methods for the admin dashboard
    getUserDisplayName() {
        if (!this.user) return 'Unknown Admin';

        const { firstName, lastName, email } = this.user;
        if (firstName || lastName) {
            return `${firstName || ''} ${lastName || ''}`.trim();
        }
        return email;
    }

    getUserRole() {
        return this.user?.role || 'Unknown';
    }

    hasPermission(permission) {
        if (!this.user) return false;

        // Super admin has all permissions
        if (this.user.role === 'SUPER_ADMIN') return true;

        // Check specific permissions
        const userPermissions = this.user.permissions || [];
        return userPermissions.includes(permission) || userPermissions.includes('*');
    }

    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }
}

// Initialize global admin auth manager
window.adminAuth = new AdminAuthManager();

console.log('🔐 Admin authentication system initialized');
