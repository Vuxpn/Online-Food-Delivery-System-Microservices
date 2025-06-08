import React, { useState, useEffect } from 'react';
import { socketService } from '../service/socketService';
import { orderService } from '../service/orderService';

const OrderTracking = ({ orderId, onClose, formatPrice }) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [trackingHistory, setTrackingHistory] = useState([]);
    const [currentStatus, setCurrentStatus] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

    useEffect(() => {
        loadOrderDetails();
        setupSocketListeners();

        if (socketService.isSocketConnected()) {
            socketService.subscribeToOrder(orderId);
        } else {
            const checkConnection = setInterval(() => {
                if (socketService.isSocketConnected()) {
                    socketService.subscribeToOrder(orderId);
                    clearInterval(checkConnection);
                }
            }, 1000);

            setTimeout(() => clearInterval(checkConnection), 10000);
        }

        return () => {
            cleanupSocketListeners();
            socketService.unsubscribeFromOrder(orderId);
        };
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderById(orderId);
            setOrderDetails(response.order || response);
            setCurrentStatus(response.order?.status || response.status || 'PENDING');

            const order = response.order || response;
            const history = [
                {
                    status: 'PENDING',
                    statusText: 'Chờ xác nhận',
                    timestamp: order.createdAt,
                    description: 'Đơn hàng đã được tạo thành công',
                    completed: true,
                    icon: '🕐',
                },
            ];

            if (order.status && order.status !== 'PENDING') {
                history.push({
                    status: order.status,
                    statusText: getStatusText(order.status),
                    timestamp: order.updatedAt || new Date(),
                    description: getStatusDescription(order.status),
                    completed: true,
                    icon: getStatusIcon(order.status),
                });
            }

            const futureSteps = getFutureSteps(order.status || 'PENDING');
            history.push(...futureSteps);

            setTrackingHistory(history);
        } catch (error) {
            console.error('Error loading order details:', error);
            showNotification('Không thể tải thông tin đơn hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        socketService.on('error', () => setConnectionStatus('error'));
        socketService.on('connectionFailed', () => setConnectionStatus('failed'));

        socketService.on('orderStatusUpdated', handleStatusUpdate);
        socketService.on('orderCancelled', handleOrderCancelled);
        socketService.on('orderDelivered', handleOrderDelivered);
        socketService.on('subscribed', (data) => {
            if (data.orderId === orderId) {
                setConnectionStatus('connected');
                showNotification('Đã kết nối theo dõi đơn hàng', 'success');
            }
        });
    };

    const cleanupSocketListeners = () => {
        socketService.off('orderStatusUpdated', handleStatusUpdate);
        socketService.off('orderCancelled', handleOrderCancelled);
        socketService.off('orderDelivered', handleOrderDelivered);
    };

    const handleStatusUpdate = (data) => {
        if (data.orderId !== orderId) return;

        console.log('📦 Status update received:', data);
        setCurrentStatus(data.status);

        setTrackingHistory((prev) => {
            const newHistory = [...prev];

            const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
            const currentStatusIndex = statusOrder.indexOf(data.status);

            newHistory.forEach((step, index) => {
                const stepIndex = statusOrder.indexOf(step.status);
                if (stepIndex <= currentStatusIndex) {
                    step.completed = true;
                    if (step.status === data.status) {
                        step.timestamp = data.updatedAt;
                        step.description = data.message || getStatusDescription(data.status);
                    }
                }
            });

            return newHistory;
        });

        showNotification(data.message || `Đơn hàng ${getStatusText(data.status)}`, 'info');

        document.title = `🔔 ${data.statusText || getStatusText(data.status)} - Food Delivery`;
        setTimeout(() => {
            document.title = 'Food Delivery';
        }, 3000);
    };

    const handleOrderCancelled = (data) => {
        if (data.orderId !== orderId) return;

        setCurrentStatus('CANCELLED');
        setTrackingHistory((prev) => [
            ...prev.filter((step) => step.status !== 'CANCELLED'),
            {
                status: 'CANCELLED',
                statusText: 'Đã hủy',
                timestamp: data.cancelledAt || new Date(),
                description: data.reason || 'Đơn hàng đã được hủy',
                completed: true,
                icon: '❌',
            },
        ]);

        showNotification(data.message || 'Đơn hàng đã được hủy', 'warning');
    };

    const handleOrderDelivered = (data) => {
        if (data.orderId !== orderId) return;

        setCurrentStatus('DELIVERED');
        showNotification(data.message || 'Đơn hàng đã được giao thành công! 🎉', 'success');
    };

    const handleCancelOrder = async () => {
        const reason = window.prompt('Lý do hủy đơn hàng (tùy chọn):') || 'Khách hàng yêu cầu hủy';

        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            try {
                setCancelling(true);
                await orderService.cancelOrder(orderId, reason);
                showNotification('Yêu cầu hủy đơn hàng đã được gửi', 'success');
            } catch (error) {
                console.error('Error cancelling order:', error);
                showNotification('Có lỗi xảy ra khi hủy đơn hàng', 'error');
            } finally {
                setCancelling(false);
            }
        }
    };

    const showNotification = (message, type) => {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500',
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[60] transform transition-all duration-300 max-w-sm`;
        notification.style.transform = 'translateX(100%)';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📦'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    };

    const getStatusText = (status) => {
        const statusMap = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            PROCESSING: 'Đang chuẩn bị',
            SHIPPED: 'Đang giao hàng',
            DELIVERED: 'Đã giao hàng',
            CANCELLED: 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const getStatusDescription = (status) => {
        const descriptions = {
            PENDING: 'Đơn hàng đang chờ xác nhận từ nhà hàng',
            CONFIRMED: 'Nhà hàng đã xác nhận đơn hàng của bạn',
            PROCESSING: 'Nhà hàng đang chuẩn bị món ăn',
            SHIPPED: 'Shipper đang giao đơn hàng đến bạn',
            DELIVERED: 'Đơn hàng đã được giao thành công',
            CANCELLED: 'Đơn hàng đã bị hủy',
        };
        return descriptions[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: '🕐',
            CONFIRMED: '✅',
            PROCESSING: '👨‍🍳',
            SHIPPED: '🚚',
            DELIVERED: '📦',
            CANCELLED: '❌',
        };
        return icons[status] || '📋';
    };

    const getFutureSteps = (currentStatus) => {
        const allSteps = [
            { status: 'CONFIRMED', text: 'Đã xác nhận', desc: 'Nhà hàng xác nhận đơn hàng', icon: '✅' },
            { status: 'PROCESSING', text: 'Đang chuẩn bị', desc: 'Chuẩn bị món ăn', icon: '👨‍🍳' },
            { status: 'SHIPPED', text: 'Đang giao hàng', desc: 'Shipper đang giao hàng', icon: '🚚' },
            { status: 'DELIVERED', text: 'Đã giao hàng', desc: 'Hoàn thành đơn hàng', icon: '📦' },
        ];

        const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
        const currentIndex = statusOrder.indexOf(currentStatus);

        return allSteps
            .filter((_, index) => index + 1 > currentIndex)
            .map((step) => ({
                status: step.status,
                statusText: step.text,
                timestamp: null,
                description: step.desc,
                completed: false,
                icon: step.icon,
            }));
    };

    const canCancelOrder = () => {
        return ['PENDING', 'CONFIRMED'].includes(currentStatus);
    };

    const getProgressPercentage = () => {
        const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        return currentStatus === 'CANCELLED' ? 0 : ((currentIndex + 1) / statusOrder.length) * 100;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="text-gray-700">Đang tải thông tin đơn hàng...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Theo dõi đơn hàng</h3>
                            <p className="text-orange-100">#{orderId?.slice(-8)}</p>
                            <div className="flex items-center mt-2 space-x-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        socketService.isSocketConnected() ? 'bg-green-300' : 'bg-red-300'
                                    }`}
                                ></div>
                                <span className="text-xs text-orange-100">
                                    {socketService.isSocketConnected() ? 'Theo dõi trực tiếp' : 'Mất kết nối'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-orange-200 p-2 hover:bg-white/20 rounded-full transition duration-200"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>

                    <div className="mt-4">
                        <div className="bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">{getStatusIcon(currentStatus)}</span>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">{getStatusText(currentStatus)}</h4>
                                <p className="text-gray-600 text-sm">{getStatusDescription(currentStatus)}</p>
                            </div>
                            {currentStatus === 'DELIVERED' && (
                                <div className="text-right">
                                    <div className="text-2xl">🎉</div>
                                    <div className="text-xs text-green-600 font-medium">Hoàn thành</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {orderDetails && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Tổng tiền:</span>
                                    <div className="font-semibold text-orange-600">
                                        {formatPrice(orderDetails.totalAmount)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Số món:</span>
                                    <div className="font-medium">
                                        {orderDetails.itemCount || orderDetails.items?.length || 0} món
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-600">Thời gian đặt:</span>
                                    <div className="font-medium">
                                        {new Date(orderDetails.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                {orderDetails.shippingAddress && (
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Địa chỉ giao hàng:</span>
                                        <div className="font-medium mt-1 p-2 bg-white rounded border">
                                            📍 {orderDetails.shippingAddress}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h4>
                        <div className="space-y-4">
                            {trackingHistory.map((step, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                            step.completed
                                                ? 'bg-green-500 text-white shadow-lg transform scale-110'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {step.completed ? '✓' : index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5
                                                    className={`font-medium transition-colors duration-300 ${
                                                        step.completed ? 'text-gray-900' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {step.icon} {step.statusText}
                                                </h5>
                                                <p
                                                    className={`text-sm transition-colors duration-300 ${
                                                        step.completed ? 'text-gray-600' : 'text-gray-400'
                                                    }`}
                                                >
                                                    {step.description}
                                                </p>
                                            </div>
                                            {step.timestamp && (
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {new Date(step.timestamp).toLocaleString('vi-VN', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {currentStatus === 'DELIVERED' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎉</span>
                                <div>
                                    <h5 className="font-semibold text-green-800">Cảm ơn bạn!</h5>
                                    <p className="text-green-700 text-sm">
                                        Đơn hàng đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            Đóng
                        </button>

                        {canCancelOrder() && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                            >
                                {cancelling ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Đang hủy...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>❌</span>
                                        <span>Hủy đơn hàng</span>
                                    </>
                                )}
                            </button>
                        )}

                        {currentStatus === 'DELIVERED' && (
                            <button
                                onClick={() => {
                                    alert('Tính năng đánh giá sẽ được cập nhật trong phiên bản tiếp theo!');
                                }}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>⭐</span>
                                <span>Đánh giá</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
