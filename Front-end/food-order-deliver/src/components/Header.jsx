import React from 'react';
import { authService } from '../service/authService';

const Header = ({ user, cartItems = [], onCartClick, onLogout, activeTab, onTabChange, socketConnected }) => {
    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
        } else {
            await authService.logout();
            window.location.href = '/auth/login';
        }
    };

    const getTotalCartItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const tabs = [
        {
            id: 'products',
            label: 'Món ăn',
            icon: '🍽️',
        },
        {
            id: 'orders',
            label: 'Đơn hàng',
            icon: '📦',
        },
    ];

    return (
        <header className="bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 shadow-lg border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-2xl mr-3">🍕</span>
                            <h1 className="text-white text-3xl font-bold drop-shadow-lg">
                                Food<span className="text-yellow-300">Delivery</span>
                            </h1>
                        </div>

                        <nav className="flex space-x-2 ml-[150px] ">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-orange-100 text-orange-700 shadow-sm'
                                            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        {activeTab === 'orders' && (
                            <div className="flex items-center space-x-2 text-xs">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        socketConnected ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                ></div>
                                <span className="text-gray-600 hidden sm:inline">
                                    {socketConnected ? 'Theo dõi trực tiếp' : 'Mất kết nối'}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={onCartClick}
                            className="relative p-2 text-gray-600 bg-white rounded-full hover:text-orange-600 transition-colors duration-200"
                        >
                            <span className="text-2xl">🛒</span>
                            {getTotalCartItems() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {getTotalCartItems()}
                                </span>
                            )}
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-lg font-bold text-white">
                                    Xin chào, <span className="font-bold">{user?.username}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition duration-200"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
