import React, { useState, useEffect } from 'react';
import { orderService } from '../service/orderService';

const OrderHistory = ({ formatPrice, onTrackOrder }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        loadOrderHistory();
    }, []);

    const loadOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrderHistory();
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Error loading order history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PROCESSING: 'bg-purple-100 text-purple-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            PROCESSING: 'Đang chuẩn bị',
            SHIPPED: 'Đang giao',
            DELIVERED: 'Đã giao',
            CANCELLED: 'Đã hủy',
        };
        return texts[status] || status;
    };

    const canTrackOrder = (status) => {
        return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(status);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Đang tải lịch sử đơn hàng...</span>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="text-8xl mb-6 block">📦</span>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Chưa có đơn hàng nào</h3>
                <p className="text-gray-600 text-lg">Hãy đặt món ăn đầu tiên của bạn!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.orderId}
                    className="bg-white rounded-lg shadow border hover:shadow-md transition duration-200"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <span>{getStatusIcon(order.status)}</span>
                                    <span>Đơn hàng #{order.orderId?.slice(-8)}</span>
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                        order.status,
                                    )}`}
                                >
                                    {getStatusText(order.status)}
                                </span>

                                {canTrackOrder(order.status) && onTrackOrder && (
                                    <button
                                        onClick={() => onTrackOrder(order.orderId)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-1"
                                        title="Theo dõi đơn hàng trực tiếp"
                                    >
                                        <span>📡</span>
                                        <span>Theo dõi</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-600">Tổng tiền:</span>
                                <span className="text-xl font-bold text-orange-600">
                                    {formatPrice(order.totalAmount)}
                                </span>
                            </div>

                            {order.shippingAddress && (
                                <div className="flex items-start space-x-2 mb-3">
                                    <span className="text-gray-600 text-sm">📍</span>
                                    <span className="text-sm text-gray-600">{order.shippingAddress}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{order.itemCount || 0} món ăn</span>
                                <div className="flex items-center space-x-3">
                                    {order.status === 'DELIVERED' && (
                                        <span className="text-green-600 text-sm font-medium flex items-center space-x-1">
                                            <span>🎉</span>
                                            <span>Hoàn thành</span>
                                        </span>
                                    )}

                                    <button
                                        onClick={() =>
                                            setSelectedOrder(selectedOrder?.orderId === order.orderId ? null : order)
                                        }
                                        className="text-orange-600 hover:text-orange-700 text-sm font-medium transition duration-200"
                                    >
                                        {selectedOrder?.orderId === order.orderId ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                    </button>
                                </div>
                            </div>

                            {selectedOrder?.orderId === order.orderId && (
                                <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Chi tiết đơn hàng</h4>
                                    <div className="space-y-2">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="text-gray-900">{item.name}</span>
                                                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                                </div>
                                                <span className="text-gray-900 font-medium">
                                                    {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.note && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Ghi chú:</span> {order.note}
                                            </p>
                                        </div>
                                    )}

                                    {canTrackOrder(order.status) && onTrackOrder && (
                                        <div className="mt-4 pt-3 border-t">
                                            <button
                                                onClick={() => onTrackOrder(order.orderId)}
                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                                            >
                                                <span>📡</span>
                                                <span>Theo dõi đơn hàng trực tiếp</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderHistory;
