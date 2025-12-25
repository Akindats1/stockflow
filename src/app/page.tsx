'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Types
interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category_name?: string;
  price: number;
  cost: number;
  stock: number;
  image: string;
  created_at: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Sale {
  id: number;
  total: number;
  discount: number;
  payment_method: string;
  created_at: string;
  items?: SaleItem[];
}

interface SaleItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  todaySales: number;
  lowStockCount: number;
  recentSales: Sale[];
  topProducts: { name: string; sold: number }[];
}

// Icons as SVG components
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
  Receipt: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 0 1 0 4H8" /><path d="M12 17.5v-11" />
    </svg>
  ),
  Tags: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" /><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="6.5" cy="9.5" r=".5" fill="currentColor" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  ),
  Minus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
  DollarSign: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Box: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  ),
  QrCode: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  Printer: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  ),
};

// API Base URL - in production, this would be your backend server
const API_BASE = '/api';

// Simulated data store (in production, this would be SQLite)
const initialCategories: Category[] = [
  { id: 1, name: 'Electronics', color: '#6366f1', icon: '/images/categories/electronics.png' },
  { id: 2, name: 'Clothing', color: '#8b5cf6', icon: '/images/categories/clothing.png' },
  { id: 3, name: 'Food & Drinks', color: '#10b981', icon: '/images/categories/food-drinks.png' },
  { id: 4, name: 'Home & Garden', color: '#f59e0b', icon: '/images/categories/home-garden.png' },
  { id: 5, name: 'Health & Beauty', color: '#ec4899', icon: '/images/categories/health-beauty.png' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Wireless Earbuds', sku: 'WE-001', category_id: 1, category_name: 'Electronics', price: 49.99, cost: 25.00, stock: 45, image: '/images/products/wireless-earbuds.png', created_at: new Date().toISOString() },
  { id: 2, name: 'Smart Watch', sku: 'SW-002', category_id: 1, category_name: 'Electronics', price: 199.99, cost: 120.00, stock: 12, image: '/images/products/smart-watch.png', created_at: new Date().toISOString() },
  { id: 3, name: 'Cotton T-Shirt', sku: 'CT-001', category_id: 2, category_name: 'Clothing', price: 24.99, cost: 8.00, stock: 100, image: '/images/products/cotton-tshirt.png', created_at: new Date().toISOString() },
  { id: 4, name: 'Denim Jeans', sku: 'DJ-001', category_id: 2, category_name: 'Clothing', price: 59.99, cost: 25.00, stock: 50, image: '/images/products/denim-jeans.png', created_at: new Date().toISOString() },
  { id: 5, name: 'Energy Drink', sku: 'ED-001', category_id: 3, category_name: 'Food & Drinks', price: 3.99, cost: 1.50, stock: 200, image: '/images/products/energy-drink.png', created_at: new Date().toISOString() },
  { id: 6, name: 'Protein Bar', sku: 'PB-001', category_id: 3, category_name: 'Food & Drinks', price: 2.49, cost: 0.80, stock: 3, image: '/images/products/protein-bar.png', created_at: new Date().toISOString() },
  { id: 7, name: 'LED Desk Lamp', sku: 'DL-001', category_id: 4, category_name: 'Home & Garden', price: 34.99, cost: 15.00, stock: 25, image: '/images/products/led-desk-lamp.png', created_at: new Date().toISOString() },
  { id: 8, name: 'Face Moisturizer', sku: 'FM-001', category_id: 5, category_name: 'Health & Beauty', price: 18.99, cost: 6.00, stock: 8, image: '/images/products/face-moisturizer.png', created_at: new Date().toISOString() },
];

const initialSales: Sale[] = [
  { id: 1, total: 124.97, discount: 0, payment_method: 'Card', created_at: '2025-12-24T20:30:00.000Z' },
  { id: 2, total: 59.99, discount: 5, payment_method: 'Cash', created_at: '2025-12-24T19:00:00.000Z' },
  { id: 3, total: 249.98, discount: 10, payment_method: 'Card', created_at: '2025-12-24T16:00:00.000Z' },
];

export default function InventoryApp() {
  // State
  const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'pos' | 'sales' | 'categories'>('dashboard');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'warning' }[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Sale | null>(null);

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts((prev: { id: number; message: string; type: 'success' | 'error' | 'warning' }[]) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev: { id: number; message: string; type: 'success' | 'error' | 'warning' }[]) => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Dashboard Stats
  const dashboardStats: DashboardStats = {
    totalRevenue: sales.reduce((sum: number, s) => sum + s.total, 0),
    totalProducts: products.length,
    todaySales: sales.filter((s: Sale) => new Date(s.created_at).toDateString() === new Date().toDateString()).length,
    lowStockCount: products.filter(p => p.stock <= 10).length,
    recentSales: sales.slice(0, 5),
    topProducts: products.slice(0, 5).map(p => ({ name: p.name, sold: Math.floor(Math.random() * 50) + 10 })),
  };

  // Product CRUD
  const handleSaveProduct = (data: Partial<Product>) => {
    if (editingProduct) {
      setProducts((prev: Product[]) => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } as Product : p));
      showToast('Product updated successfully');
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: data.name || '',
        sku: data.sku || `SKU-${Date.now()}`,
        category_id: data.category_id || 1,
        category_name: categories.find(c => c.id === data.category_id)?.name || 'Uncategorized',
        price: data.price || 0,
        cost: data.cost || 0,
        stock: data.stock || 0,
        image: data.image || '📦',
        created_at: new Date().toISOString(),
      };
      setProducts(prev => [...prev, newProduct]);
      showToast('Product added successfully');
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted', 'warning');
  };

  // Category CRUD
  const handleSaveCategory = (data: Partial<Category>) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...data } as Category : c));
      showToast('Category updated successfully');
    } else {
      const newCategory: Category = {
        id: Date.now(),
        name: data.name || '',
        color: data.color || '#6366f1',
        icon: data.icon || '📁',
      };
      setCategories(prev => [...prev, newCategory]);
      showToast('Category added successfully');
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category deleted', 'warning');
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast('Product out of stock', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('Not enough stock', 'warning');
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.stock) {
            showToast('Not enough stock', 'warning');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Complete sale
  const completeSale = (paymentMethod: string) => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    // Update stock
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    // Create sale record
    const newSale: Sale = {
      id: Date.now(),
      total: cartTotal,
      discount: 0,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
      items: cart.map(item => ({
        id: Date.now() + item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    setSales(prev => [newSale, ...prev]);

    // Show receipt
    setCurrentReceipt(newSale);
    setShowReceipt(true);
    setCart([]);
    showToast(`Sale completed: ₦${cartTotal.toFixed(2)}`, 'success');
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // QR Code functions
  const handleShowQR = (product: Product) => {
    setQrProduct(product);
    setShowQrModal(true);
  };

  const handleScanResult = (sku: string) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      addToCart(product);
      setShowScanner(false);
      showToast(`Added ${product.name} to cart`, 'success');
    } else {
      showToast('Product not found', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Menu Toggle */}
      <button
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
      </button>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <img src="/images/logo.png" alt="StockFlow" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="sidebar-logo-text">StockFlow</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
          >
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveView('products'); setMobileMenuOpen(false); }}
          >
            <Icons.Package />
            <span>Products</span>
          </button>
          <button
            className={`nav-item ${activeView === 'pos' ? 'active' : ''}`}
            onClick={() => { setActiveView('pos'); setMobileMenuOpen(false); }}
          >
            <Icons.ShoppingCart />
            <span>Point of Sale</span>
          </button>
          <button
            className={`nav-item ${activeView === 'sales' ? 'active' : ''}`}
            onClick={() => { setActiveView('sales'); setMobileMenuOpen(false); }}
          >
            <Icons.Receipt />
            <span>Sales History</span>
          </button>
          <button
            className={`nav-item ${activeView === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveView('categories'); setMobileMenuOpen(false); }}
          >
            <Icons.Tags />
            <span>Categories</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div>
            <div className="page-header">
              <div className="page-title">
                <h1>Dashboard</h1>
                <p>Welcome back! Here&apos;s what&apos;s happening with your store.</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="glass-card stat-card">
                <div className="stat-icon blue">
                  <Icons.DollarSign />
                </div>
                <div className="stat-content">
                  <div className="stat-value">₦{dashboardStats.totalRevenue.toFixed(2)}</div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-change positive">↑ 12.5% from last week</div>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon purple">
                  <Icons.Box />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardStats.totalProducts}</div>
                  <div className="stat-label">Total Products</div>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon green">
                  <Icons.ShoppingBag />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardStats.todaySales}</div>
                  <div className="stat-label">Today&apos;s Sales</div>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon orange">
                  <Icons.AlertTriangle />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{dashboardStats.lowStockCount}</div>
                  <div className="stat-label">Low Stock Items</div>
                  {dashboardStats.lowStockCount > 0 && (
                    <div className="stat-change negative">Needs attention</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Sales & Low Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px', background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>Recent Sales</h3>
                <div className="table-container" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardStats.recentSales.map(sale => (
                        <tr key={sale.id}>
                          <td>#{sale.id}</td>
                          <td>₦{sale.total.toFixed(2)}</td>
                          <td>{new Date(sale.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px', background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>Low Stock Alert</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {products.filter(p => p.stock <= 10).map(product => (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        <span>{product.name}</span>
                      </div>
                      <span className={`badge ${product.stock <= 5 ? 'badge-danger' : 'badge-warning'}`}>
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                  {products.filter(p => p.stock <= 10).length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>All products are well stocked!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products View */}
        {activeView === 'products' && (
          <div>
            <div className="page-header">
              <div className="page-title">
                <h1>Products</h1>
                <p>Manage your inventory</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                <Icons.Plus /> Add Product
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Icons.Search />
                </span>
              </div>
              <div className="pos-categories">
                <button
                  className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <img src={cat.icon} alt={cat.name} style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="product-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="glass-card product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className={`product-badge ${product.stock <= 10 ? 'low-stock' : 'in-stock'}`}>
                      {product.stock <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <div className="product-info">
                    <div className="product-category">{product.category_name}</div>
                    <div className="product-name">{product.name}</div>
                    <div className="product-meta">
                      <span className="product-price">₦{product.price.toFixed(2)}</span>
                      <span className="product-stock">{product.stock} units</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button
                      className="btn btn-primary btn-icon"
                      onClick={() => handleShowQR(product)}
                      title="View QR Code"
                    >
                      <Icons.QrCode />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => { setEditingProduct(product); setShowModal(true); }}
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <Icons.Package />
                <h3>No products found</h3>
                <p>Try adjusting your search or add a new product</p>
              </div>
            )}
          </div>
        )}

        {/* POS View */}
        {activeView === 'pos' && (
          <div className="pos-container">
            <div className="pos-products">
              <div className="page-title" style={{ marginBottom: '16px' }}>
                <h1>Point of Sale</h1>
                <p>Select products to add to cart</p>
              </div>

              {/* Search */}
              <div className="pos-search" style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => setShowScanner(true)}
                  title="Scan QR Code"
                >
                  <Icons.Camera />
                  <span>Scan QR</span>
                </button>
              </div>

              {/* Categories */}
              <div className="pos-categories">
                <button
                  className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <img src={cat.icon} alt={cat.name} style={{ width: '20px', height: '20px', marginRight: '6px' }} />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="pos-product-grid">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="glass-card pos-product-card"
                    onClick={() => addToCart(product)}
                    style={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                  >
                    <div className="pos-product-image">
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="pos-product-name">{product.name}</div>
                    <div className="pos-product-price">₦{product.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Panel */}
            <div className={`cart-panel ${cartExpanded ? 'expanded' : ''}`}>
              <div className="cart-header" onClick={() => setCartExpanded(!cartExpanded)}>
                <h3>Current Order</h3>
                <span className="cart-count">{cartCount} items</span>
              </div>

              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <Icons.ShoppingCart />
                    <p>Your cart is empty</p>
                    <p style={{ fontSize: '0.875rem' }}>Add products to get started</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">₦{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => updateCartQuantity(item.id, -1)}>
                          <Icons.Minus />
                        </button>
                        <span>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCartQuantity(item.id, 1)}>
                          <Icons.Plus />
                        </button>
                      </div>
                      <button
                        className="btn btn-icon"
                        style={{ background: 'transparent', color: 'var(--danger)' }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Icons.X />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="cart-row">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-row">
                    <span>Tax (0%)</span>
                    <span>₦0.00</span>
                  </div>
                  <div className="cart-row total">
                    <span>Total</span>
                    <span>₦{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, minWidth: '100px' }}
                    onClick={() => completeSale('Cash')}
                    disabled={cart.length === 0}
                  >
                    💵 Cash
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '100px' }}
                    onClick={() => completeSale('Card')}
                    disabled={cart.length === 0}
                  >
                    💳 Card
                  </button>
                  <button
                    className="btn btn-success"
                    style={{ flex: 1, minWidth: '100px' }}
                    onClick={() => completeSale('Transfer')}
                    disabled={cart.length === 0}
                  >
                    🏦 Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales History View */}
        {activeView === 'sales' && (
          <div>
            <div className="page-header">
              <div className="page-title">
                <h1>Sales History</h1>
                <p>View all transactions</p>
              </div>
            </div>

            <div className="glass-card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Date & Time</th>
                      <th>Payment</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(sale => (
                      <tr key={sale.id}>
                        <td>#{sale.id}</td>
                        <td>{new Date(sale.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <span className="badge badge-success">
                            {sale.payment_method === 'Cash' ? '💵' : sale.payment_method === 'Card' ? '💳' : '🏦'} {sale.payment_method}
                          </span>
                        </td>
                        <td>₦{sale.discount.toFixed(2)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>₦{sale.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {sales.length === 0 && (
              <div className="empty-state">
                <Icons.Receipt />
                <h3>No sales yet</h3>
                <p>Complete your first sale to see it here</p>
              </div>
            )}
          </div>
        )}

        {/* Categories View */}
        {activeView === 'categories' && (
          <div>
            <div className="page-header">
              <div className="page-title">
                <h1>Categories</h1>
                <p>Organize your products</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}>
                <Icons.Plus /> Add Category
              </button>
            </div>

            <div className="product-grid">
              {categories.map(category => (
                <div key={category.id} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-md)',
                      background: category.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      <img src={category.icon} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h4 style={{ background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>{category.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {products.filter(p => p.category_id === category.id).length} products
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => { setEditingCategory(category); setShowCategoryModal(true); }}
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => { setShowQrModal(false); setQrProduct(null); }}
        product={qrProduct}
      />

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        sale={currentReceipt}
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product Modal Component
function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  categories
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  product: Product | null;
  categories: Category[];
}) {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({ name: '', sku: '', price: 0, cost: 0, stock: 0, category_id: categories[0]?.id, image: '📦' });
    }
  }, [product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add Product'}</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>SKU</label>
                <input
                  type="text"
                  className="input"
                  value={formData.sku || ''}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select
                  className="input select"
                  value={formData.category_id || ''}
                  onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Selling Price (₦)</label>
                <input
                  type="number"
                  className="input"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Cost Price (₦)</label>
                <input
                  type="number"
                  className="input"
                  step="0.01"
                  min="0"
                  value={formData.cost || ''}
                  onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  value={formData.stock || ''}
                  onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Image</label>
                <div
                  className={`image-upload-preview ${formData.image ? 'has-image' : ''}`}
                  onClick={() => document.getElementById('product-image-input')?.click()}
                >
                  {formData.image ? (
                    <img src={formData.image} alt="Product preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Icons.Upload />
                      <span style={{ fontSize: '0.875rem' }}>Click to upload image</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG up to 2MB</span>
                    </div>
                  )}
                </div>
                <input
                  id="product-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Image size must be less than 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
  category: Category | null;
}) {
  const [formData, setFormData] = useState<Partial<Category>>({});

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ name: '', color: '#6366f1', icon: '📁' });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{category ? 'Edit Category' : 'Add Category'}</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Category Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Color</label>
                <input
                  type="color"
                  className="input"
                  style={{ height: '48px', padding: '4px' }}
                  value={formData.color || '#6366f1'}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Category Image</label>
                <div
                  className={`image-upload-preview ${formData.icon ? 'has-image' : ''}`}
                  onClick={() => document.getElementById('category-image-input')?.click()}
                  style={{ height: '160px' }}
                >
                  {formData.icon ? (
                    <img src={formData.icon} alt="Category preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Icons.Upload />
                      <span style={{ fontSize: '0.875rem' }}>Click to upload image</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG up to 2MB</span>
                    </div>
                  )}
                </div>
                <input
                  id="category-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Image size must be less than 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, icon: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {category ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// QR Code Modal Component
function QrCodeModal({
  isOpen,
  onClose,
  product
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && product && canvasRef.current) {
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        product.sku,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QR Code generation failed:', error);
        }
      );
    }
  }, [isOpen, product]);

  const handleDownload = () => {
    if (canvasRef.current && product) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${product.sku}-qrcode.png`;
      link.href = url;
      link.click();
    }
  };

  if (!product) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Product QR Code</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
                {product.name}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                SKU: {product.sku}
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '24px',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}>
              <canvas ref={canvasRef} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Scan this QR code to quickly add this product to your cart
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={handleDownload}>
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}

// Scanner Modal Component
function ScannerModal({
  isOpen,
  onClose,
  onScan
}: {
  isOpen: boolean;
  onClose: () => void;
  onScan: (sku: string) => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScan(decodedText);
            if (scannerRef.current) {
              scannerRef.current.clear();
              scannerRef.current = null;
            }
          },
          (error) => {
            // Ignore errors
          }
        );
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { });
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScan]);

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Scan QR Code</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Position the QR code within the camera view to scan
            </p>
          </div>
          <div id="qr-reader" style={{ width: '100%' }}></div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Receipt Modal Component
function ReceiptModal({
  isOpen,
  onClose,
  sale
}: {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Receipt</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: 'Courier New', monospace; padding: 20px; }
          .receipt { max-width: 400px; margin: 0 auto; }
          .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          .receipt-header h2 { margin: 0; font-size: 24px; }
          .receipt-header p { margin: 5px 0; font-size: 12px; }
          .receipt-items { margin: 20px 0; }
          .receipt-item { display: flex; justify-content: space-between; margin: 10px 0; }
          .receipt-item-name { flex: 1; }
          .receipt-item-qty { width: 50px; text-align: center; }
          .receipt-item-price { width: 80px; text-align: right; }
          .receipt-divider { border-top: 1px dashed #000; margin: 10px 0; }
          .receipt-total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
          .receipt-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .receipt-row.total { font-weight: bold; font-size: 18px; }
          .receipt-footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px; }
          @media print { body { padding: 0; } }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(receiptRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    if (receiptRef.current && sale) {
      const content = receiptRef.current.innerText;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${sale.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!sale) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Receipt</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">
          <div ref={receiptRef} style={{
            fontFamily: "'Courier New', monospace",
            backgroundColor: '#fff',
            color: '#000',
            padding: '20px',
            borderRadius: '8px'
          }}>
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#000' }}>StockFlow</h2>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>Inventory Management System</p>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>Tel: +234 XXX XXX XXXX</p>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>Email: sales@stockflow.com</p>
            </div>

            {/* Sale Info */}
            <div style={{ marginBottom: '20px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                <span>Receipt #:</span>
                <span style={{ fontWeight: 'bold' }}>{sale.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                <span>Date:</span>
                <span>{new Date(sale.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                <span>Time:</span>
                <span>{new Date(sale.created_at).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                <span>Payment:</span>
                <span style={{ fontWeight: 'bold' }}>{sale.payment_method}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 'bold', marginBottom: '10px', fontSize: '12px', color: '#000' }}>
                <span>Item</span>
                <span style={{ textAlign: 'center' }}>Qty</span>
                <span style={{ textAlign: 'right' }}>Price</span>
              </div>
              {sale.items && sale.items.map(item => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', margin: '8px 0', fontSize: '12px', color: '#000' }}>
                  <span>{item.product_name}</span>
                  <span style={{ textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ textAlign: 'right' }}>₦{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', marginTop: '10px' }}>
              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px', color: '#000' }}>
                <span>Subtotal:</span>
                <span>₦{sale.total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px', color: '#000' }}>
                <span>Discount:</span>
                <span>₦{sale.discount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px', color: '#000' }}>
                <span>Tax (0%):</span>
                <span>₦0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                <span>TOTAL:</span>
                <span>₦{sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '10px', borderTop: '2px dashed #000', fontSize: '12px' }}>
              <p style={{ margin: '5px 0' }}>Thank you for your business!</p>
              <p style={{ margin: '5px 0' }}>Please come again</p>
              <p style={{ margin: '10px 0 5px', fontSize: '11px' }}>
                Powered by StockFlow Inventory System
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Icons.Printer />
              Print Receipt
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownload}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Icons.Download />
              Download
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
