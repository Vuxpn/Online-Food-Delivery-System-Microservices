import api from './api';

export const orderService = {
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/order', orderData);
            return response.data;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    },

    getOrderHistory: async () => {
        try {
            const response = await api.get('/order');
            return response.data;
        } catch (error) {
            console.error('Get order history error:', error);
            throw error;
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/order/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Get order by id error:', error);
            throw error;
        }
    },

    cancelOrder: async (orderId, reason) => {
        try {
            const response = await api.put(`/order/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error('Cancel order error:', error);
            throw error;
        }
    },

    trackOrder: async (orderId) => {
        try {
            const response = await api.get(`/order/${orderId}/track`);
            return response.data;
        } catch (error) {
            console.error('Track order error:', error);
            throw error;
        }
    },
};
