import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../service/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
