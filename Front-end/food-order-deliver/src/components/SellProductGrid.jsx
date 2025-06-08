import React, { useState } from 'react';

const SellerProductGrid = ({ products, loading, formatPrice, onEdit, onDelete, onToggleStatus }) => {
    const [confirmDelete, setConfirmDelete] = useState(null);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="text-8xl mb-6 block">🍽️</span>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Chưa có món ăn nào</h3>
                <p className="text-gray-600">Hãy tạo món ăn đầu tiên!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all"
                    >
                        <div className="relative h-48 bg-gray-100">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl">🍽️</span>
                                </div>
                            )}

                            <div className="absolute top-3 right-3">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                            </div>

                            {product.category && (
                                <div className="absolute top-3 left-3">
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                        {product.category}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.name}</h3>

                            {product.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold text-orange-600">{formatPrice(product.price)}</span>
                                <span className="text-sm text-gray-600">SL: {product.quantity}</span>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(product)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm"
                                >
                                    ✏️ Sửa
                                </button>

                                <button
                                    onClick={() => onToggleStatus(product)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                                        product.quantity > 0
                                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                >
                                    {product.quantity > 0 ? '⏸️ Ẩn' : '▶️ Hiện'}
                                </button>

                                <button
                                    onClick={() => setConfirmDelete(product)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">⚠️ Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc muốn xóa <strong>"{confirmDelete.name}"</strong>?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    onDelete(confirmDelete.id);
                                    setConfirmDelete(null);
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                            >
                                Xóa
                            </button>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellerProductGrid;
