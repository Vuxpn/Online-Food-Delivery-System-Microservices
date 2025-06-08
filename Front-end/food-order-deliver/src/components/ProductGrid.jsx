import React from 'react';
import FoodCard from './FoodCard';

const ProductGrid = ({ products, loading, onAddToCart, formatPrice, isSellerMode = false, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="text-8xl mb-6 block">🍽️</span>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {isSellerMode ? 'Chưa có món ăn nào' : 'Không tìm thấy món ăn'}
                </h3>
                <p className="text-gray-600 text-lg">
                    {isSellerMode
                        ? 'Hãy tạo món ăn đầu tiên của bạn!'
                        : 'Các nhà hàng đang cập nhật menu. Vui lòng quay lại sau!'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <FoodCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    formatPrice={formatPrice}
                    isSellerMode={isSellerMode}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
