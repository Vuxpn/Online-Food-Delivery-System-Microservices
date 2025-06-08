import React, { useEffect, useState } from 'react';
import { authService } from '../service/authService';
import { productService } from '../service/productService';
import { orderService } from '../service/orderService';
import { socketService } from '../service/socketService';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import OrderHistory from '../components/OrderHistory';
import OrderTracking from '../components/OrderTracking';
import Cart from '../components/Cart';
import Toast from '../components/Toast';

const BuyerDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadProducts();
        initializeSocket();

        return () => {
            socketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())),
            );
            setFilteredProducts(filtered);
        }
    }, [products, searchTerm]);

    const initializeSocket = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                await socketService.connect(token);
                setSocketConnected(true);
                setupSocketListeners();
                console.log('✅ Socket connected successfully');
            }
        } catch (error) {
            console.error('❌ Failed to connect socket:', error);
            setSocketConnected(false);
        }
    };

    const setupSocketListeners = () => {
        socketService.on('orderStatusUpdated', (data) => {
            console.log('📦 Order status updated:', data);
            addToast({
                type: 'info',
                title: 'Cập nhật đơn hàng',
                message: `Đơn hàng #${data.orderId?.slice(-8)} - ${data.message}`,
                duration: 5000,
            });

            document.title = `🔔 ${data.statusText} - Food Delivery`;
            setTimeout(() => {
                document.title = 'Food Delivery';
            }, 3000);
        });

        socketService.on('orderCreated', (data) => {
            console.log('🆕 Order created:', data);
            addToast({
                type: 'success',
                title: 'Đặt hàng thành công',
                message: `Đơn hàng #${data.orderId?.slice(-8)} đã được tạo thành công`,
                duration: 5000,
            });
        });

        socketService.on('orderCancelled', (data) => {
            console.log('❌ Order cancelled:', data);
            addToast({
                type: 'warning',
                title: 'Đơn hàng đã hủy',
                message: `Đơn hàng #${data.orderId?.slice(-8)} đã được hủy`,
                duration: 5000,
            });
        });

        socketService.on('orderDelivered', (data) => {
            console.log('✅ Order delivered:', data);
            addToast({
                type: 'success',
                title: 'Giao hàng thành công! 🎉',
                message: `Đơn hàng #${data.orderId?.slice(-8)} đã được giao thành công!`,
                duration: 7000,
            });
        });

        socketService.on('error', (error) => {
            console.error('🚨 Socket error:', error);
            setSocketConnected(false);
        });

        socketService.on('connectionFailed', () => {
            setSocketConnected(false);
            addToast({
                type: 'error',
                title: 'Mất kết nối',
                message: 'Mất kết nối theo dõi đơn hàng',
                duration: 5000,
            });
        });
    };

    const addToast = (toastData) => {
        const toast = {
            id: Date.now(),
            timestamp: new Date(),
            ...toastData,
        };

        setToasts((prev) => [toast, ...prev.slice(0, 4)]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts();
            setProducts(response.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
            addToast({
                type: 'error',
                title: 'Lỗi tải dữ liệu',
                message: 'Không thể tải danh sách món ăn',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find((item) => item.id === product.id);
        if (existingItem) {
            setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }

        addToast({
            type: 'success',
            message: `Đã thêm "${product.name}" vào giỏ hàng`,
            duration: 3000,
        });
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item.id !== productId));
    };

    const updateCartQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)));
        }
    };

    const handleCheckout = async (orderData) => {
        try {
            const response = await orderService.createOrder(orderData);
            const orderId = response.orderId || response.order?.orderId;

            addToast({
                type: 'success',
                title: 'Đặt hàng thành công!',
                message: 'Đang theo dõi đơn hàng...',
                duration: 5000,
            });

            setCart([]);
            setShowCart(false);
            setActiveTab('orders');

            if (orderId && socketService.isSocketConnected()) {
                setTimeout(() => {
                    setTrackingOrderId(orderId);
                }, 1000);
            }

            return response;
        } catch (error) {
            console.error('Checkout error:', error);
            addToast({
                type: 'error',
                title: 'Lỗi đặt hàng',
                message: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
                duration: 5000,
            });
            throw error;
        }
    };

    const handleTrackOrder = (orderId) => {
        setTrackingOrderId(orderId);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            socketService.disconnect();
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleReconnectSocket = () => {
        addToast({
            type: 'info',
            message: 'Đang kết nối lại...',
            duration: 3000,
        });
        initializeSocket();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const renderProducts = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Danh sách món ăn</h2>
                <p className="text-gray-600 text-lg mb-6">Khám phá các món ăn ngon từ các nhà hàng đối tác</p>

                <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm món ăn, nhà hàng..." />
            </div>

            {searchTerm && (
                <div className="text-center text-gray-600">
                    Tìm thấy <span className="font-semibold text-orange-600">{filteredProducts.length}</span> kết quả
                    cho "{searchTerm}"
                    {filteredProducts.length === 0 && (
                        <div className="mt-4">
                            <p>Không tìm thấy món ăn nào phù hợp.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-orange-600 hover:text-orange-700 font-medium mt-2"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ProductGrid
                products={filteredProducts}
                loading={loading}
                onAddToCart={addToCart}
                formatPrice={formatPrice}
            />
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Lịch sử đặt hàng</h2>
                <p className="text-gray-600 text-lg">Theo dõi trạng thái và chi tiết các đơn hàng của bạn</p>

                {!socketConnected && (
                    <div className="flex items-center justify-center space-x-3 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-700 font-medium">Mất kết nối theo dõi trực tiếp</span>
                        <button
                            onClick={handleReconnectSocket}
                            className="text-red-600 hover:text-red-700 font-medium underline"
                        >
                            Kết nối lại
                        </button>
                    </div>
                )}
            </div>

            <OrderHistory formatPrice={formatPrice} onTrackOrder={handleTrackOrder} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                user={user}
                cartItems={cart}
                onCartClick={() => setShowCart(true)}
                onLogout={handleLogout}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                socketConnected={socketConnected}
            />

            <Toast toasts={toasts} removeToast={removeToast} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'orders' && renderOrders()}
            </main>

            <Cart
                isOpen={showCart}
                onClose={() => setShowCart(false)}
                cartItems={cart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
                formatPrice={formatPrice}
            />

            {trackingOrderId && (
                <OrderTracking
                    orderId={trackingOrderId}
                    onClose={() => setTrackingOrderId(null)}
                    formatPrice={formatPrice}
                />
            )}
        </div>
    );
};

export default BuyerDashboard;
