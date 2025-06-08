import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../service/authService';
import AuthLayout from '../pages/AuthLayout';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const response = await authService.login(formData);

            if (response && response.user) {
                const { user } = response;

                setTimeout(() => {
                    if (user.role === 'BUYER') {
                        navigate('/buyer/dashboard', { replace: true });
                    } else if (user.role === 'SELLER') {
                        navigate('/seller/dashboard', { replace: true });
                    }
                }, 100);
            } else {
                setError('Phản hồi từ server không hợp lệ');
            }
        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                const errorMessage =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    'Tên đăng nhập hoặc mật khẩu không đúng';
                setError(errorMessage);
            } else if (error.request) {
                setError('Không thể kết nối đến server. Vui lòng thử lại.');
            } else {
                setError(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại!">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm text-center animate-shake">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                            placeholder="Tên đăng nhập hoặc email"
                            required
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                            placeholder="Mật khẩu"
                            required
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.username || !formData.password}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang đăng nhập...
                        </div>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            disabled={loading}
                        />
                        <span className="ml-1.5 text-gray-600">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link
                        to="/auth/forgot-password"
                        className="text-orange-600 hover:text-orange-700 hover:underline"
                        tabIndex={loading ? -1 : 0}
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-gray-500">Hoặc đăng nhập với</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        disabled={loading}
                        className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 text-sm disabled:opacity-50"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <span className="mr-1.5 text-base">🌐</span>
                        Google
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 text-sm disabled:opacity-50"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <span className="mr-1.5 text-base">📱</span>
                        Facebook
                    </button>
                </div>

                <div className="text-center pt-3">
                    <p className="text-gray-600 text-xs">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/auth/register"
                            className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                            tabIndex={loading ? -1 : 0}
                        >
                            Đăng ký tại đây
                        </Link>
                    </p>
                </div>
            </form>

            <style jsx>{`
                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </AuthLayout>
    );
};

export default LoginForm;
