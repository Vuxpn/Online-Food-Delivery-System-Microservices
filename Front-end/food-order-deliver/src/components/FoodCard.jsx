import React, { useState } from 'react';

const FoodCard = ({ product, onAddToCart, formatPrice, disabled = false, isSellerMode = false, onEdit, onDelete }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleAddToCart = () => {
        if (!disabled && product.quantity > 0 && onAddToCart) {
            onAddToCart(product);
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(product);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(product.id);
            setShowDeleteConfirm(false);
        }
    };

    const confirmDelete = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const cancelDelete = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="h-48 bg-gray-200 relative overflow-hidden group">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {!isSellerMode && product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Hết hàng</span>
                    </div>
                )}

                {product.category && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                            {product.category}
                        </span>
                    </div>
                )}

                {isSellerMode && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit();
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-colors"
                                title="Chỉnh sửa"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
                                title="Xóa"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
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
                        <span className="text-sm text-gray-500 block">{isSellerMode ? 'Tồn kho' : 'Còn lại'}</span>
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

                {isSellerMode ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                        >
                            Xóa
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={disabled || product.quantity <= 0}
                        className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ${
                            disabled || product.quantity <= 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                        {product.quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                )}
            </div>

            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={cancelDelete}
                >
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa món <strong>"{product.name}"</strong>?
                                <br />
                                Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodCard;
