import React, { useEffect, useState } from 'react';
import { authService } from '../service/authService';
import { productService } from '../service/productService';
import { orderService } from '../service/orderService';

const SellerDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Product form states
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
    });
    const [productImages, setProductImages] = useState([]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadProducts();
        loadOrders();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getMyProducts();
            setProducts(response.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const response = await orderService.getOrderHistory();
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = '/auth/login';
    };

    const handleProductFormChange = (e) => {
        setProductForm({
            ...productForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProductImages(files);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productForm, productImages);
            } else {
                await productService.createProduct(productForm, productImages);
            }

            resetProductForm();
            loadProducts();
            alert(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Có lỗi xảy ra khi lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            category: product.category || '',
        });
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await productService.deleteProduct(productId);
                loadProducts();
                alert('Xóa sản phẩm thành công!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Có lỗi xảy ra khi xóa sản phẩm');
            }
        }
    };

    const resetProductForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            quantity: '',
            category: '',
        });
        setProductImages([]);
        setEditingProduct(null);
        setShowProductForm(false);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Sản phẩm</h3>
                        <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">📦</span>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Đơn hàng</h3>
                        <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Tổng kho</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {products.reduce((total, product) => total + product.quantity, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Quản lý sản phẩm</h3>
                    <button
                        onClick={() => setShowProductForm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="p-6">
                {products.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-2 block">🍽️</span>
                        <p className="text-gray-600">Chưa có sản phẩm nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="border rounded-lg p-4">
                                <div className="h-32 bg-gray-200 rounded mb-3">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-3xl">🍽️</span>
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-semibold mb-2">{product.name}</h4>
                                <p className="text-orange-600 font-medium mb-2">{formatPrice(product.price)}</p>
                                <p className="text-sm text-gray-600 mb-3">Còn lại: {product.quantity}</p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition duration-200"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition duration-200"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Quản lý đơn hàng</h3>
            </div>
            <div className="p-6">
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-2 block">📦</span>
                        <p className="text-gray-600">Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold">Đơn hàng #{order.id}</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            order.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order.status === 'CONFIRMED'
                                                ? 'bg-blue-100 text-blue-800'
                                                : order.status === 'DELIVERED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-orange-600 font-medium">{formatPrice(order.totalAmount)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🍕</span>
                            <h1 className="text-xl font-bold text-gray-900">FoodDelivery - Seller</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Xin chào, <span className="font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Tổng quan', icon: '📊' },
                            { id: 'products', label: 'Sản phẩm', icon: '🍽️' },
                            { id: 'orders', label: 'Đơn hàng', icon: '📦' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'orders' && renderOrders()}
            </main>

            {/* Product Form Modal */}
            {showProductForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold">
                                    {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                                </h3>
                                <button onClick={resetProductForm} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleProductSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên sản phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={productForm.name}
                                        onChange={handleProductFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                        placeholder="Nhập tên sản phẩm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={productForm.description}
                                        onChange={handleProductFormChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                        placeholder="Mô tả sản phẩm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={productForm.price}
                                            onChange={handleProductFormChange}
                                            required
                                            min="0"
                                            step="1000"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số lượng *
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={productForm.quantity}
                                            onChange={handleProductFormChange}
                                            required
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={productForm.category}
                                        onChange={handleProductFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                        placeholder="Nhập danh mục"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình ảnh (tối đa 5 ảnh)
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={resetProductForm}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    {loading ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
