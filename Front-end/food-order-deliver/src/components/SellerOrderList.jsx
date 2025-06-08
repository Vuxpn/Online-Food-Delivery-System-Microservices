import React, { useState, useEffect } from 'react';
import { orderService } from '../service/orderService';

const SellerOrderList = ({ formatPrice, addToast }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        loadSellerOrders();
    }, []);

    const loadSellerOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getSellerOrders();
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Error loading seller orders:', error);
            addToast({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể tải danh sách đơn hàng',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            addToast({
                type: 'success',
                title: 'Thành công',
                message: 'Cập nhật trạng thái đơn hàng thành công',
                duration: 3000,
            });
            loadSellerOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            addToast({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể cập nhật trạng thái đơn hàng',
                duration: 5000,
            });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
            PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
            SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            DELIVERED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

    const getNextStatusOptions = (currentStatus) => {
        const statusFlow = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PROCESSING', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
        };
        return statusFlow[currentStatus] || [];
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-600">Các đơn hàng sẽ hiển thị ở đây khi có khách đặt món của bạn</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.orderId}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-900">Đơn hàng #{order.orderId.slice(-8)}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                            order.status,
                                        )}`}
                                    >
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>🕒 {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                    <p>💰 {formatPrice(order.totalAmount)}</p>
                                    <p>📦 {order.itemCount} món</p>
                                    {order.shippingAddress && <p>📍 {order.shippingAddress}</p>}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                    >
                                        Xem chi tiết →
                                    </button>
                                </div>
                            </div>

                            {/* Status Update */}
                            {getNextStatusOptions(order.status).length > 0 && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {getNextStatusOptions(order.status).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(order.orderId, status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                status === 'CANCELLED'
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {getStatusText(status)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Chi tiết đơn hàng #{selectedOrder.orderId.slice(-8)}
                                </h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Thông tin đơn hàng</h3>
                                        <div className="space-y-2 text-sm">
                                            <p>
                                                <span className="text-gray-600">Mã đơn:</span> {selectedOrder.orderId}
                                            </p>
                                            <p>
                                                <span className="text-gray-600">Ngày đặt:</span>{' '}
                                                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                            <p>
                                                <span className="text-gray-600">Trạng thái:</span>
                                                <span
                                                    className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(
                                                        selectedOrder.status,
                                                    )}`}
                                                >
                                                    {getStatusText(selectedOrder.status)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng</h3>
                                        <div className="space-y-2 text-sm">
                                            <p>
                                                <span className="text-gray-600">Địa chỉ:</span>{' '}
                                                {selectedOrder.shippingAddress}
                                            </p>
                                            {selectedOrder.note && (
                                                <p>
                                                    <span className="text-gray-600">Ghi chú:</span> {selectedOrder.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Danh sách món ăn</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">
                                                        {formatPrice(item.totalPrice)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatPrice(item.unitPrice)}/món
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                                        <span className="text-xl font-bold text-orange-600">
                                            {formatPrice(selectedOrder.totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {getNextStatusOptions(selectedOrder.status).length > 0 && (
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Cập nhật trạng thái</h3>
                                        <div className="flex gap-3">
                                            {getNextStatusOptions(selectedOrder.status).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        updateOrderStatus(selectedOrder.orderId, status);
                                                        setSelectedOrder(null);
                                                    }}
                                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                                        status === 'CANCELLED'
                                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                                            : 'bg-green-500 text-white hover:bg-green-600'
                                                    }`}
                                                >
                                                    {getStatusText(status)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellerOrderList;
