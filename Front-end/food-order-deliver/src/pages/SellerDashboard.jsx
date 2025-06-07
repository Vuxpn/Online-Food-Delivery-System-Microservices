import React, { useEffect, useState } from 'react';
import { authService } from '../service/authService';

const SellerDashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = '/auth/login';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🍕</span>
                            <h1 className="text-xl font-bold text-gray-900">FoodDelivery - Seller</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Xin chào, <span className="font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Người bán</h2>
                    <p className="text-gray-600">Quản lý cửa hàng và đơn hàng của bạn!</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Đơn hàng mới</h3>
                                <p className="text-2xl font-bold text-orange-600">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">🍽️</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Sản phẩm</h3>
                                <p className="text-2xl font-bold text-blue-600">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Doanh thu</h3>
                                <p className="text-2xl font-bold text-green-600">0đ</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">⭐</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Đánh giá</h3>
                                <p className="text-2xl font-bold text-yellow-600">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động nhanh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-200">
                            <span className="text-2xl mb-2">➕</span>
                            <span className="text-sm font-medium text-gray-700">Thêm sản phẩm</span>
                        </button>

                        <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200">
                            <span className="text-2xl mb-2">📋</span>
                            <span className="text-sm font-medium text-gray-700">Quản lý đơn hàng</span>
                        </button>

                        <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-200">
                            <span className="text-2xl mb-2">📊</span>
                            <span className="text-sm font-medium text-gray-700">Thống kê</span>
                        </button>

                        <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-200">
                            <span className="text-2xl mb-2">⚙️</span>
                            <span className="text-sm font-medium text-gray-700">Cài đặt cửa hàng</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SellerDashboard;
