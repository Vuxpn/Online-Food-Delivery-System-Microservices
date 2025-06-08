import React from 'react';

const FoodCard = ({ product, onAddToCart, formatPrice, disabled = false }) => {
    const handleAddToCart = () => {
        if (!disabled && product.quantity > 0 && onAddToCart) {
            onAddToCart(product);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 card-hover">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Hết hàng</span>
                    </div>
                )}

                {product.category && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {product.category}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{product.name}</h3>

                {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                    <span className="text-orange-600 font-bold text-lg">{formatPrice(product.price)}</span>
                    <div className="text-right">
                        <span className="text-sm text-gray-500 block">Còn lại</span>
                        <span
                            className={`text-sm font-medium ${
                                product.quantity > 10
                                    ? 'text-green-600'
                                    : product.quantity > 0
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                            }`}
                        >
                            {product.quantity}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={disabled || product.quantity <= 0}
                    className={`w-full font-semibold py-2.5 px-4 rounded-lg transition duration-200 ${
                        disabled || product.quantity <= 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white btn-gradient'
                    }`}
                >
                    {product.quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        </div>
    );
};

export default FoodCard;
