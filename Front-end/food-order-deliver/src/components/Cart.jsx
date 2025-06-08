import React, { useState } from 'react';

const Cart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout, formatPrice }) => {
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        customerName: '',
        phoneNumber: '',
        shippingAddress: '',
        note: '',
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const getTotalAmount = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleFormChange = (e) => {
        setCheckoutForm({
            ...checkoutForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        if (!checkoutForm.customerName.trim()) {
            alert('Vui lòng nhập tên người nhận');
            return;
        }
        if (!checkoutForm.phoneNumber.trim()) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        if (!checkoutForm.shippingAddress.trim()) {
            alert('Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                userId: checkoutForm.customerName,
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: getTotalAmount(),
                shippingAddress: checkoutForm.shippingAddress,
                note: checkoutForm.note,
            };

            await onCheckout(orderData);

            setCheckoutForm({
                customerName: '',
                phoneNumber: '',
                shippingAddress: '',
                note: '',
            });
            setShowCheckoutForm(false);
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) return;
        setShowCheckoutForm(true);
    };

    const handleBackToCart = () => {
        setShowCheckoutForm(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
                <div className="p-6 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {showCheckoutForm ? 'Thông tin đặt hàng' : 'Giỏ hàng của bạn'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {showCheckoutForm
                                    ? 'Vui lòng điền thông tin giao hàng'
                                    : `${cartItems.length} món ăn đã chọn`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition duration-200"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </div>

                {!showCheckoutForm ? (
                    <>
                        <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-6xl mb-4 block">🛒</span>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Giỏ hàng trống</h4>
                                    <p className="text-gray-600">Hãy thêm một số món ăn ngon vào giỏ hàng!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition duration-200"
                                        >
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <span className="text-2xl">🍽️</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-orange-600 font-medium text-sm">
                                                    {formatPrice(item.price)} × {item.quantity}
                                                </p>
                                                <p className="text-gray-900 font-semibold">
                                                    = {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition duration-200 font-medium"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition duration-200 font-medium"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition duration-200"
                                                title="Xóa khỏi giỏ hàng"
                                            >
                                                <span className="text-lg">🗑️</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {formatPrice(getTotalAmount())}
                                    </span>
                                </div>
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 btn-gradient"
                                >
                                    Tiến hành đặt hàng
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <form onSubmit={handleSubmitOrder} className="p-6">
                            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Tóm tắt đơn hàng</h4>
                                    <div className="space-y-1 text-sm">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex justify-between">
                                                <span>
                                                    {item.name} x{item.quantity}
                                                </span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-orange-600">{formatPrice(getTotalAmount())}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên người nhận *
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={checkoutForm.customerName}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                                        placeholder="Nhập tên người nhận"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={checkoutForm.phoneNumber}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ giao hàng *
                                    </label>
                                    <textarea
                                        name="shippingAddress"
                                        value={checkoutForm.shippingAddress}
                                        onChange={handleFormChange}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                                        placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                    />
                                    <button
                                        type="button"
                                        className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                        onClick={() => alert('Tính năng chọn trên bản đồ sẽ được cập nhật sớm!')}
                                    >
                                        📍 Chọn trên bản đồ
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú (tùy chọn)
                                    </label>
                                    <textarea
                                        name="note"
                                        value={checkoutForm.note}
                                        onChange={handleFormChange}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                                        placeholder="Ghi chú thêm cho đơn hàng (ví dụ: không cay, ít đường...)"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleBackToCart}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 btn-gradient"
                                >
                                    {loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
