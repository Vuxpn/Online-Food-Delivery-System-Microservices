import React, { useEffect, useState } from 'react';
import { authService } from '../service/authService';
import { productService } from '../service/productService';
import { orderService } from '../service/orderService';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import ProductForm from '../components/ProductForm';
import SellerOrderList from '../components/SellerOrderList';
import Toast from '../components/Toast';

const SellerDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toasts, setToasts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadMyProducts();
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

    const loadMyProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getMyProducts();
            setProducts(response.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
            addToast({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể tải danh sách sản phẩm',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const addToast = (toast) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { ...toast, id }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleProductSubmit = async (productData, images) => {
        try {
            setFormLoading(true);
            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData, images);
                addToast({
                    type: 'success',
                    title: 'Cập nhật thành công',
                    message: `Món "${productData.name}" đã được cập nhật`,
                    duration: 5000,
                });
            } else {
                await productService.createProduct(productData, images);
                addToast({
                    type: 'success',
                    title: 'Tạo thành công',
                    message: `Món "${productData.name}" đã được tạo`,
                    duration: 5000,
                });
            }

            setShowProductForm(false);
            setEditingProduct(null);
            loadMyProducts();
        } catch (error) {
            console.error('Error submitting product:', error);
            addToast({
                type: 'error',
                title: 'Lỗi',
                message: editingProduct ? 'Không thể cập nhật sản phẩm' : 'Không thể tạo sản phẩm',
                duration: 5000,
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            await productService.deleteProduct(productId);
            addToast({
                type: 'success',
                title: 'Xóa thành công',
                message: 'Sản phẩm đã được xóa',
                duration: 5000,
            });
            loadMyProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            addToast({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xóa sản phẩm',
                duration: 5000,
            });
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    const sellerTabs = [
        {
            id: 'products',
            label: 'Món ăn của tôi',
            icon: '🍽️',
        },
        {
            id: 'orders',
            label: 'Đơn hàng',
            icon: '📋',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                user={user}
                onLogout={handleLogout}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={sellerTabs}
                hideCart={true}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý món ăn</h1>
                                <p className="text-gray-600 mt-1">Tạo và quản lý các món ăn của bạn</p>
                            </div>
                            <button
                                onClick={() => setShowProductForm(true)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <span>+</span>
                                Thêm món mới
                            </button>
                        </div>

                        {/* Search Bar */}
                        <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm món ăn của bạn..." />

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
                                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🍽️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {searchTerm ? 'Không tìm thấy món ăn nào' : 'Chưa có món ăn nào'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm
                                        ? 'Hãy thử tìm kiếm với từ khóa khác'
                                        : 'Hãy tạo món ăn đầu tiên của bạn'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => setShowProductForm(true)}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
                                    >
                                        Thêm món mới
                                    </button>
                                )}
                            </div>
                        ) : (
                            <ProductGrid
                                products={filteredProducts}
                                formatPrice={formatPrice}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                                isSellerMode={true}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                            <p className="text-gray-600 mt-1">Xem và cập nhật trạng thái đơn hàng</p>
                        </div>
                        <SellerOrderList formatPrice={formatPrice} addToast={addToast} />
                    </div>
                )}
            </main>

            {/* Product Form Modal */}
            {showProductForm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <ProductForm
                            product={editingProduct}
                            onSubmit={handleProductSubmit}
                            onCancel={() => {
                                setShowProductForm(false);
                                setEditingProduct(null);
                            }}
                            loading={formLoading}
                        />
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default SellerDashboard;
