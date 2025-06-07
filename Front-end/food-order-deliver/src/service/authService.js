import api from './api';

export const authService = {
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { access_token, user } = response.data;

            if (access_token && user) {
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                return response.data;
            } else {
                throw new Error('Phản hồi từ server không hợp lệ');
            }
        } catch (error) {
            console.error('Login error:', error);

            localStorage.removeItem('access_token');
            localStorage.removeItem('user');

            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    isAuthenticated: () => {
        try {
            const token = localStorage.getItem('access_token');
            const user = localStorage.getItem('user');
            return !!(token && user);
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },
};
