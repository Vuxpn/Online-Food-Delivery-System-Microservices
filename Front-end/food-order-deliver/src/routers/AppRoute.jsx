import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from '../service/authService';

// Components
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import BuyerDashboard from '../pages/BuyerDashboard';
import SellerDashboard from '../pages/SellerDashboard';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/auth/login"
                    element={
                        isAuthenticated ? (
                            <Navigate
                                to={currentUser?.role === 'BUYER' ? '/buyer/dashboard' : '/seller/dashboard'}
                                replace
                            />
                        ) : (
                            <LoginForm />
                        )
                    }
                />
                <Route
                    path="/auth/register"
                    element={
                        isAuthenticated ? (
                            <Navigate
                                to={currentUser?.role === 'BUYER' ? '/buyer/dashboard' : '/seller/dashboard'}
                                replace
                            />
                        ) : (
                            <RegisterForm />
                        )
                    }
                />

                {/* Buyer Routes */}
                <Route
                    path="/buyer/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['BUYER']}>
                            <BuyerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Seller Routes */}
                <Route
                    path="/seller/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['SELLER']}>
                            <SellerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default Routes */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate
                                to={currentUser?.role === 'BUYER' ? '/buyer/dashboard' : '/seller/dashboard'}
                                replace
                            />
                        ) : (
                            <Navigate to="/auth/login" replace />
                        )
                    }
                />

                {/* Unauthorized */}
                <Route
                    path="/unauthorized"
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
                                <p className="text-gray-600 mb-8">Bạn không có quyền truy cập vào trang này.</p>
                                <button
                                    onClick={() => window.history.back()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
