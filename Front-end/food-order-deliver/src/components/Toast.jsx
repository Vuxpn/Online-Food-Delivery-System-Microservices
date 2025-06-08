import React, { useEffect, useState } from 'react';

const Toast = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);

        const timer = setTimeout(() => {
            handleRemove();
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300);
    };

    const getToastStyles = (type) => {
        const styles = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
        };
        return styles[type] || styles.info;
    };

    const getIcon = (type) => {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '📦',
        };
        return icons[type] || '📦';
    };

    return (
        <div
            className={`
                relative bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform
                ${getToastStyles(toast.type)}
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                ${isLeaving ? 'translate-x-full opacity-0' : ''}
            `}
        >
            <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{getIcon(toast.type)}</span>
                <div className="flex-1 min-w-0">
                    {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                    <p className="text-sm">{toast.message}</p>
                    {toast.timestamp && (
                        <p className="text-xs opacity-70 mt-1">
                            {new Date(toast.timestamp).toLocaleTimeString('vi-VN')}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleRemove}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <span className="text-lg">×</span>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-progress"></div>
        </div>
    );
};

export default Toast;
