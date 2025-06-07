import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../service/authService';
import AuthLayout from '../pages/AuthLayout';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        role: 'BUYER', // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const validatePassword = (password) => {
        const regex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?/~`]{8,20}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!agreeTerms) {
            setError('Vui lòng đồng ý với điều khoản sử dụng');
            setLoading(false);
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('Mật khẩu phải có 8-20 ký tự, bao gồm ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt');
            setLoading(false);
            return;
        }

        try {
            const response = await authService.register(formData);
            const { user } = response;

            if (user.role === 'BUYER') {
                navigate('/buyer/dashboard');
            } else if (user.role === 'SELLER') {
                navigate('/seller/dashboard');
            }
        } catch (error) {
            setError(error.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Đăng ký" subtitle="Tạo tài khoản mới để bắt đầu">
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs text-center">
                        {error}
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-2.5">
                    {/* Username Field */}
                    <div>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                            placeholder="Tên của bạn"
                            required
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                            placeholder="Email của bạn"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                            placeholder="Mật khẩu"
                            required
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="BUYER"
                                checked={formData.role === 'BUYER'}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <div
                                className={`p-2.5 text-center border-2 rounded-lg transition-all duration-200 ${
                                    formData.role === 'BUYER'
                                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-base mb-0.5">🛒</div>
                                <div className="text-xs font-medium">Khách hàng</div>
                            </div>
                        </label>

                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="role"
                                value="SELLER"
                                checked={formData.role === 'SELLER'}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <div
                                className={`p-2.5 text-center border-2 rounded-lg transition-all duration-200 ${
                                    formData.role === 'SELLER'
                                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-base mb-0.5">👨‍🍳</div>
                                <div className="text-xs font-medium">Người bán</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang tạo tài khoản...
                        </div>
                    ) : (
                        'Tạo tài khoản'
                    )}
                </button>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        required
                    />
                    <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                        Bằng cách tiếp tục, tôi đồng ý với{' '}
                        <Link to="/terms" className="text-orange-600 hover:underline">
                            điều khoản sử dụng
                        </Link>{' '}
                        và{' '}
                        <Link to="/privacy" className="text-orange-600 hover:underline">
                            chính sách bảo mật
                        </Link>
                    </label>
                </div>

                {/* Login Link */}
                <div className="text-center pt-2">
                    <p className="text-gray-600 text-xs">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/auth/login"
                            className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                        >
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterForm;
