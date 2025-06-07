import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
                <div className="absolute bottom-40 right-10 w-20 h-20 bg-white/10 rounded-full blur-lg animate-pulse delay-700"></div>
            </div>

            <div className="relative h-full flex flex-col items-center justify-center px-4">
                {/* Logo Section */}
                <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                        <div className="bg-white/20 backdrop-blur-lg rounded-full w-16 h-16 flex items-center justify-center shadow-2xl border border-white/30">
                            <span className="text-2xl">🍕</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs">✨</span>
                        </div>
                    </div>

                    <h1 className="text-white text-3xl font-bold drop-shadow-lg">
                        Food<span className="text-yellow-300">Delivery</span>
                    </h1>
                </div>

                {/* Top Section */}
                <div className="text-center mb-4">
                    <p className="text-white/90 text-sm font-medium tracking-wide">
                        Đặt đồ ăn nhanh chóng • Tiện lợi • An toàn
                    </p>
                </div>

                {/* Auth Card */}
                <div className="w-full max-w-sm">
                    <div className="relative group">
                        {/* Card glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

                        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-white/20">
                            {/* Header */}
                            <div className="text-center mb-5">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                                    {title}
                                </h2>
                                {subtitle && <p className="text-gray-600 text-sm font-medium">{subtitle}</p>}
                            </div>

                            {children}

                            {/* Decorative elements */}
                            <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-60"></div>
                            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-40"></div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-white/80 text-xs">
                    <p>© 2025 FoodDelivery. Made with ❤️ in Vietnam</p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
