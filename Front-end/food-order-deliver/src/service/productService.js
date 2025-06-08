import api from './api';

export const productService = {

    getAllProducts: async () => {
        try {
            const response = await api.get('/product/all');
            return response.data;
        } catch (error) {
            console.error('Get all products error:', error);
            throw error;
        }
    },


    getMyProducts: async () => {
        try {
            const response = await api.get('/product');
            return response.data;
        } catch (error) {
            console.error('Get my products error:', error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await api.get(`/product/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get product by id error:', error);
            throw error;
        }
    },

    createProduct: async (productData, images) => {
        try {
            const formData = new FormData();
          
            Object.keys(productData).forEach(key => {
                if (productData[key] !== undefined && productData[key] !== '') {
                    formData.append(key, productData[key]);
                }
            });

            if (images && images.length > 0) {
                images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await api.post('/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    },

    updateProduct: async (id, productData, images) => {
        try {
            const formData = new FormData();
            
    
            Object.keys(productData).forEach(key => {
                if (productData[key] !== undefined && productData[key] !== '') {
                    formData.append(key, productData[key]);
                }
            });

         
            if (images && images.length > 0) {
                images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await api.put(`/product/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    },

   
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/product/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    },
};