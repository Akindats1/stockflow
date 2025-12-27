'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AuthScreen, useAuth, Business } from './components/Auth';

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
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
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
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
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
  // Nigerian Food Products with AI-generated images
  { id: 1, name: 'Indomie Instant Noodles (Pack of 40)', sku: 'IND-NDL-040', category_id: 3, category_name: 'Food & Drinks', price: 5200, cost: 4200, stock: 85, image: '/images/products/indomie-noodles.png', created_at: new Date().toISOString() },
  { id: 2, name: 'Peak Powdered Milk 900g', sku: 'PK-MLK-900', category_id: 3, category_name: 'Food & Drinks', price: 4500, cost: 3600, stock: 45, image: '/images/products/peak-milk.png', created_at: new Date().toISOString() },
  { id: 3, name: 'Golden Morn Cereal 900g', sku: 'GM-CRL-900', category_id: 3, category_name: 'Food & Drinks', price: 2800, cost: 2100, stock: 60, image: '/images/products/golden-morn.png', created_at: new Date().toISOString() },
  { id: 4, name: 'Gala Sausage Roll (Pack of 24)', sku: 'GLA-SR-024', category_id: 3, category_name: 'Food & Drinks', price: 3600, cost: 2800, stock: 120, image: '/images/products/gala-sausage-roll.png', created_at: new Date().toISOString() },
  { id: 5, name: 'Milo Activ-Go 500g', sku: 'MIL-AG-500', category_id: 3, category_name: 'Food & Drinks', price: 2400, cost: 1800, stock: 55, image: '/images/products/milo-drink.png', created_at: new Date().toISOString() },
  { id: 6, name: 'Dangote Sugar 1kg', sku: 'DNG-SGR-01', category_id: 3, category_name: 'Food & Drinks', price: 1200, cost: 900, stock: 200, image: '/images/products/dangote-sugar.png', created_at: new Date().toISOString() },
  { id: 7, name: 'Palm Oil 5 Litres', sku: 'PLM-OIL-05', category_id: 3, category_name: 'Food & Drinks', price: 6500, cost: 5000, stock: 35, image: '/images/products/palm-oil.png', created_at: new Date().toISOString() },
  { id: 8, name: 'Ankara Fabric 6 Yards', sku: 'ANK-FAB-06', category_id: 2, category_name: 'Clothing', price: 4500, cost: 3000, stock: 40, image: '/images/products/ankara-fabric.png', created_at: new Date().toISOString() },
  { id: 9, name: 'Ijebu Garri 5kg', sku: 'IJB-GRI-05', category_id: 3, category_name: 'Food & Drinks', price: 2500, cost: 1800, stock: 75, image: '/images/products/garri.png', created_at: new Date().toISOString() },
  { id: 10, name: 'Chin Chin Snack 500g', sku: 'CHN-CHN-50', category_id: 3, category_name: 'Food & Drinks', price: 1500, cost: 1000, stock: 90, image: '/images/products/chin-chin.png', created_at: new Date().toISOString() },
];

const initialSales: Sale[] = [
  { id: 1, total: 124.97, discount: 0, payment_method: 'Card', created_at: '2025-12-24T20:30:00.000Z' },
  { id: 2, total: 59.99, discount: 5, payment_method: 'Cash', created_at: '2025-12-24T19:00:00.000Z' },
  { id: 3, total: 249.98, discount: 10, payment_method: 'Card', created_at: '2025-12-24T16:00:00.000Z' },
];

export default function InventoryApp() {
  // State
  const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'pos' | 'sales' | 'categories' | 'settings'>('dashboard');
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Sale | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Auth Hook
  const {
    isAuthenticated,
    authScreen,
    setAuthScreen,
    currentUser,
    currentBusiness,
    users,
    initAuth,
    refreshUsers,
    handleRegisterBusiness,
    handleLogin,
    handleLogout,
    handleAddUser,
    handleDeleteUser,
  } = useAuth();

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, []);

  // Auth event handlers with toast notifications
  const onRegister = (business: { name: string; phone: string; email: string; address?: string }, user: { name: string; email: string; password: string }) => {
    const result = handleRegisterBusiness(business, user);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const onLogin = (email: string, password: string) => {
    const result = handleLogin(email, password);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const onLogout = () => {
    const result = handleLogout();
    showToast(result.message, result.success ? 'success' : 'error');
  };

  const onAddUser = (userData: { name: string; email: string; password: string; role: 'admin' | 'user' }) => {
    const result = handleAddUser(userData);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      refreshUsers(); // Ensure users list is refreshed
    }
    return result.success;
  };

  const onDeleteUser = (userId: number) => {
    const result = handleDeleteUser(userId);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      refreshUsers(); // Ensure users list is refreshed
    }
    return result.success;
  };

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts((prev: { id: number; message: string; type: 'success' | 'error' | 'warning' }[]) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev: { id: number; message: string; type: 'success' | 'error' | 'warning' }[]) => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Dashboard Stats - Real-time calculation
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalRevenue = sales.reduce((sum: number, s) => sum + s.total, 0);
    const totalProducts = products.length;
    const today = new Date().toDateString();
    const todaySales = sales.filter((s: Sale) => new Date(s.created_at).toDateString() === today).length;
    const lowStockCount = products.filter(p => p.stock <= 10).length;
    const recentSales = sales.slice(-5).reverse(); // Last 5 sales, most recent first

    // Calculate top products based on actual sales
    const productSalesMap = new Map<number, number>();
    sales.forEach(sale => {
      // In a real app, you'd have sale items with product IDs
      // For now, we'll use a simplified version
      products.forEach(product => {
        const currentCount = productSalesMap.get(product.id) || 0;
        productSalesMap.set(product.id, currentCount + Math.floor(Math.random() * 5));
      });
    });

    const topProducts = products
      .map(p => ({
        name: p.name,
        sold: productSalesMap.get(p.id) || 0
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return {
      totalRevenue,
      totalProducts,
      todaySales,
      lowStockCount,
      recentSales,
      topProducts,
    };
  }, [products, sales]); // Recalculate when products or sales change

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

  // If not authenticated, show auth screen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        authScreen={authScreen}
        setAuthScreen={setAuthScreen}
        onRegister={onRegister}
        onLogin={onLogin}
        toasts={toasts}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <span className="sidebar-logo-text">StockFlow</span>
        </div>

        {/* Business Info */}
        <div className="sidebar-business-info">
          <div className="business-name">{currentBusiness?.name || 'My Business'}</div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => setActiveView('products')}
          >
            <Icons.Package />
            <span>Products</span>
          </button>
          <button
            className={`nav-item ${activeView === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveView('pos')}
          >
            <Icons.ShoppingCart />
            <span>Point of Sale</span>
          </button>
          <button
            className={`nav-item ${activeView === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveView('sales')}
          >
            <Icons.Receipt />
            <span>Sales</span>
          </button>
          <button
            className={`nav-item ${activeView === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveView('categories')}
          >
            <Icons.Tags />
            <span>Categories</span>
          </button>

          {/* Settings - Super Admin Only */}
          {currentUser?.role === 'super_admin' && (
            <button
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <Icons.Settings />
              <span>Settings</span>
            </button>
          )}

          {/* Logout */}
          <button
            className="nav-item logout-btn"
            onClick={onLogout}
          >
            <Icons.X />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard View */}
        {
          activeView === 'dashboard' && (
            <div>
              <div className="page-header">
                <div className="page-title">
                  <h1>Dashboard</h1>
                  <p>Welcome back! Here's what's happening with your store.</p>
                </div>
              </div>

              {/* Stats Grid - Modern Cards */}
              <div className="dashboard-grid">
                <div className="stat-card-modern">
                  <div className="stat-icon-modern blue">
                    <Icons.DollarSign />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">₦{dashboardStats.totalRevenue.toFixed(2)}</span>
                    <span className="stat-trend positive">↑ 12.5%</span>
                  </div>
                </div>

                <div className="stat-card-modern">
                  <div className="stat-icon-modern purple">
                    <Icons.Box />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Products</span>
                    <span className="stat-value">{dashboardStats.totalProducts}</span>
                    <span className="stat-trend neutral">—</span>
                  </div>
                </div>

                <div className="stat-card-modern">
                  <div className="stat-icon-modern green">
                    <Icons.ShoppingBag />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Today's Sales</span>
                    <span className="stat-value">{dashboardStats.todaySales}</span>
                    <span className="stat-trend positive">↑ 8%</span>
                  </div>
                </div>

                <div className="stat-card-modern">
                  <div className="stat-icon-modern orange">
                    <Icons.AlertTriangle />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Low Stock Items</span>
                    <span className="stat-value">{dashboardStats.lowStockCount}</span>
                    {dashboardStats.lowStockCount > 0 && (
                      <span className="stat-trend negative">Needs attention</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Two Column Layout - Recent Sales & Low Stock */}
              <div className="dashboard-two-column">
                {/* Recent Sales Table */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <h3 className="dashboard-section-title">Recent Sales</h3>
                    <a className="dashboard-section-action" onClick={() => setActiveView('sales')}>
                      View All
                    </a>
                  </div>
                  <div className="dashboard-section-body">
                    <div className="dashboard-table-container">
                      <table className="data-table-modern">
                        <thead>
                          <tr>
                            <th>Sale ID</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Payment</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardStats.recentSales.slice(0, 5).map(sale => (
                            <tr key={sale.id}>
                              <td style={{ fontWeight: 600 }}>#{sale.id}</td>
                              <td>{new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>
                                {new Date(sale.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td>
                                <span className="status-badge active" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                                  {sale.payment_method}
                                </span>
                              </td>
                              <td style={{ fontWeight: 600 }}>₦{sale.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {dashboardStats.recentSales.length === 0 && (
                        <div className="dashboard-empty">
                          <Icons.ShoppingBag />
                          <h4>No sales yet</h4>
                          <p>Sales will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert Table */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <h3 className="dashboard-section-title">Low Stock Alert</h3>
                    <a className="dashboard-section-action" onClick={() => setActiveView('products')}>
                      View All
                    </a>
                  </div>
                  <div className="dashboard-section-body">
                    <div className="dashboard-table-container">
                      <table className="data-table-modern">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Stock</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.filter(p => p.stock <= 10).slice(0, 5).map(product => (
                            <tr key={product.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="product-thumbnail"
                                    style={{ width: '32px', height: '32px' }}
                                  />
                                  <span style={{ fontWeight: 500 }}>{product.name}</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: 600 }}>{product.stock} units</td>
                              <td>
                                <span className={`status-badge ${product.stock <= 5 ? 'out-of-stock' : 'low-stock'}`}>
                                  {product.stock <= 5 ? 'Critical' : 'Low'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {products.filter(p => p.stock <= 10).length === 0 && (
                        <div className="dashboard-empty">
                          <Icons.Package />
                          <h4>All products well stocked!</h4>
                          <p>No low stock items</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.125rem', fontWeight: 600 }}>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <div className="quick-action-card" onClick={() => { setActiveView('products'); setEditingProduct(null); setShowModal(true); }}>
                    <div className="quick-action-icon">
                      <Icons.Plus />
                    </div>
                    <div className="quick-action-content">
                      <div className="quick-action-title">Add Product</div>
                      <div className="quick-action-desc">Add new item to inventory</div>
                    </div>
                  </div>

                  <div className="quick-action-card" onClick={() => setActiveView('pos')}>
                    <div className="quick-action-icon">
                      <Icons.ShoppingBag />
                    </div>
                    <div className="quick-action-content">
                      <div className="quick-action-title">New Sale</div>
                      <div className="quick-action-desc">Process a new transaction</div>
                    </div>
                  </div>

                  <div className="quick-action-card" onClick={() => setActiveView('sales')}>
                    <div className="quick-action-icon">
                      <Icons.Receipt />
                    </div>
                    <div className="quick-action-content">
                      <div className="quick-action-title">View Reports</div>
                      <div className="quick-action-desc">Sales history & analytics</div>
                    </div>
                  </div>

                  <div className="quick-action-card" onClick={() => setActiveView('categories')}>
                    <div className="quick-action-icon">
                      <Icons.Tags />
                    </div>
                    <div className="quick-action-content">
                      <div className="quick-action-title">Manage Categories</div>
                      <div className="quick-action-desc">Organize your products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Products View */}
        {
          activeView === 'products' && (
            <div className="products-page">
              {/* Page Header */}
              <div className="products-header">
                <h1 className="products-title">Products</h1>
                <div className="products-header-actions">
                  <button className="btn-outline" onClick={() => alert('Export functionality coming soon!')}>
                    <Icons.Download />
                    Export
                  </button>
                  <button className="btn-filled" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                    New product
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="products-toolbar">
                <div className="search-wrapper">
                  <Icons.Search />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="filter-btn">
                  Filters
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {selectedCategory !== null && (
                  <div className="active-filter">
                    Status: {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory(null)}>×</button>
                  </div>
                )}
              </div>

              {/* Products Table Container */}
              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th className="th-checkbox">
                        <input type="checkbox" />
                      </th>
                      <th className="th-product">Product Name</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="th-actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr
                        key={product.id}
                        onClick={() => { setViewingProduct(product); setShowProductDetail(true); }}
                      >
                        <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" />
                        </td>
                        <td className="td-product">
                          <div className="product-cell">
                            <div className="product-img">
                              <img src={product.image} alt={product.name} />
                            </div>
                            <span className="product-name">{product.name}</span>
                          </div>
                        </td>
                        <td className="td-category">{product.category_name}</td>
                        <td className="td-sku">{product.sku}</td>
                        <td className="td-stock">
                          <div className="stock-cell">
                            <span className="stock-qty">{product.stock}</span>
                            <span className="stock-label">in stock</span>
                          </div>
                        </td>
                        <td className="td-price">₦{product.price.toLocaleString()}</td>
                        <td className="td-status">
                          <span className={`status-pill ${product.stock <= 0 ? 'out-of-stock' : product.stock <= 10 ? 'low-stock' : 'active'}`}>
                            {product.stock <= 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'Active'}
                          </span>
                        </td>
                        <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="action-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = e.currentTarget.nextElementSibling as HTMLElement;
                              // Close all other menus first
                              document.querySelectorAll('.action-dropdown.show').forEach(el => {
                                if (el !== menu) el.classList.remove('show');
                              });
                              menu?.classList.toggle('show');
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>
                          <div className="action-dropdown">
                            <button onClick={() => { setViewingProduct(product); setShowProductDetail(true); }}>
                              <Icons.Eye /> View
                            </button>
                            <button onClick={() => { setEditingProduct(product); setShowModal(true); }}>
                              <Icons.Edit /> Edit
                            </button>
                            <button onClick={() => handleShowQR(product)}>
                              <Icons.QrCode /> QR Code
                            </button>
                            <button className="danger" onClick={() => handleDeleteProduct(product.id)}>
                              <Icons.Trash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="empty-table">
                    <Icons.Package />
                    <h3>No products found</h3>
                    <p>Try adjusting your search or add a new product</p>
                    <button className="btn-filled" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                      Add Product
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="products-pagination">
                  <button className="page-btn" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button className="page-num active">1</button>
                  <button className="page-num">2</button>
                  <button className="page-num">3</button>
                  <button className="page-num">4</button>
                  <button className="page-num">5</button>
                  <span className="page-dots">...</span>
                  <button className="page-num">{Math.ceil(filteredProducts.length / 10) || 1}</button>
                  <button className="page-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        }

        {/* POS View */}
        {activeView === 'pos' && (
          <div>
            <div className="page-header">
              <div className="page-title">
                <h1>Point of Sale</h1>
                <p>Process transactions and manage sales</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowScanner(!showScanner)}
                >
                  <Icons.Camera />
                  {showScanner ? 'Close Scanner' : 'Scan Barcode'}
                </button>
              </div>
            </div>

            {/* Barcode Scanner */}
            <BarcodeScanner
              isOpen={showScanner}
              onClose={() => setShowScanner(false)}
              onScan={handleScanResult}
            />

            <div className="pos-layout" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '24px',
              alignItems: 'start',
              height: 'calc(100vh - 140px)',
              overflow: 'hidden'
            }}>
              {/* Products Grid */}
              <div style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}>
                {/* Category Filter */}
                <div className="pos-categories" style={{ marginBottom: '20px' }}>
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
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
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

                {/* Products Grid */}
                <div className="pos-product-grid">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="pos-product-card"
                      onClick={() => addToCart(product)}
                      style={{ cursor: product.stock <= 0 ? 'not-allowed' : 'pointer', opacity: product.stock <= 0 ? 0.5 : 1 }}
                    >
                      <div className="pos-product-image">
                        <img src={product.image} alt={product.name} />
                        {product.stock <= 0 && (
                          <div className="out-of-stock-overlay">
                            Out of Stock
                          </div>
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <div className="low-stock-badge">
                            Low Stock
                          </div>
                        )}
                      </div>
                      <div className="pos-product-details">
                        <h4>{product.name}</h4>
                        <p className="pos-product-category">{product.category_name}</p>
                        <div className="pos-product-footer">
                          <span className="pos-product-price">₦{product.price.toFixed(2)}</span>
                          <span className="pos-product-stock">{product.stock} in stock</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="empty-state" style={{ padding: '60px 20px' }}>
                    <Icons.Package />
                    <h3>No products found</h3>
                    <p>Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>

              {/* Shopping Cart */}
              <div className="pos-cart-container" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="glass-card" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Cart Header */}
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>
                        Shopping Cart
                      </h3>
                      <span className="cart-count-badge">{cartCount}</span>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }}>
                    {cart.length === 0 ? (
                      <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <Icons.ShoppingCart />
                        <h4>Cart is empty</h4>
                        <p>Add products to start a sale</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cart.map(item => (
                          <div key={item.id} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-details">
                              <h5>{item.name}</h5>
                              <p>₦{item.price.toFixed(2)}</p>
                            </div>
                            <div className="cart-item-actions">
                              <div className="quantity-controls">
                                <button
                                  className="quantity-btn"
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Icons.Minus />
                                </button>
                                <span className="quantity-value">{item.quantity}</span>
                                <button
                                  className="quantity-btn"
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  disabled={item.quantity >= item.stock}
                                >
                                  <Icons.Plus />
                                </button>
                              </div>
                              <button
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Icons.Trash />
                              </button>
                            </div>
                            <div className="cart-item-total">
                              ₦{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                      {/* Totals */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                          <span style={{ fontWeight: 500 }}>₦{cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tax (0%)</span>
                          <span style={{ fontWeight: 500 }}>₦0.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Total</span>
                          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                            ₦{cartTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                          Payment Method
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <button
                            className="payment-method-btn active"
                            onClick={(e) => {
                              document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('active'));
                              e.currentTarget.classList.add('active');
                            }}
                          >
                            Cash
                          </button>
                          <button
                            className="payment-method-btn"
                            onClick={(e) => {
                              document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('active'));
                              e.currentTarget.classList.add('active');
                            }}
                          >
                            Card
                          </button>
                          <button
                            className="payment-method-btn"
                            onClick={(e) => {
                              document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('active'));
                              e.currentTarget.classList.add('active');
                            }}
                          >
                            Transfer
                          </button>
                          <button
                            className="payment-method-btn"
                            onClick={(e) => {
                              document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('active'));
                              e.currentTarget.classList.add('active');
                            }}
                          >
                            Mobile
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setCart([])}
                          style={{ flex: 1 }}
                        >
                          Clear
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const activeMethod = document.querySelector('.payment-method-btn.active');
                            const paymentMethod = activeMethod?.textContent || 'Cash';
                            completeSale(paymentMethod);
                          }}
                          style={{ flex: 2 }}
                        >
                          Complete Sale
                        </button>
                      </div>
                    </div>
                  )}
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
                <p>View and manage all transactions</p>
              </div>
              <button className="btn-export" onClick={() => alert('Export functionality coming soon!')}>
                <Icons.Download />
                Export
              </button>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <table className="data-table-modern">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Date & Time</th>
                    <th>Payment Method</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td style={{ fontWeight: 600 }}>#{sale.id}</td>
                      <td>
                        <div>
                          <div>{new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(sale.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge active">
                          {sale.payment_method}
                        </span>
                      </td>
                      <td>{sale.items?.length || 0} items</td>
                      <td style={{ fontWeight: 600, fontSize: '1rem' }}>₦{sale.total.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setCurrentReceipt(sale);
                            setShowReceipt(true);
                          }}
                        >
                          <Icons.Receipt />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sales.length === 0 && (
                <div className="empty-state" style={{ padding: '60px 20px' }}>
                  <Icons.Receipt />
                  <h3>No sales yet</h3>
                  <p>Sales will appear here after you complete transactions</p>
                </div>
              )}
            </div>
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

        {/* Settings View - Super Admin Only */}
        {activeView === 'settings' && currentUser?.role === 'super_admin' && (
          <div>
            <div className="page-header">
              <div className="page-title">
                <h1>Settings</h1>
                <p>Manage your business settings and users</p>
              </div>
            </div>

            {/* User Management Section */}
            <div className="dashboard-section" style={{ marginBottom: '24px' }}>
              <div className="dashboard-section-header">
                <h3 className="dashboard-section-title">
                  <Icons.Users />
                  <span style={{ marginLeft: '8px' }}>User Management</span>
                </h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddUserModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Icons.UserPlus />
                  Add User
                </button>
              </div>
              <div className="dashboard-section-body">
                <div className="dashboard-table-container">
                  <table className="data-table-modern">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: user.role === 'super_admin' ? 'var(--gradient-primary)' : user.role === 'admin' ? 'var(--warning)' : 'var(--info)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                              }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: '500' }}>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`status-badge ${user.role === 'super_admin' ? 'success' : user.role === 'admin' ? 'warning' : 'info'}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            {user.id !== currentUser?.id ? (
                              <button
                                className="btn btn-danger btn-icon"
                                onClick={() => onDeleteUser(user.id)}
                                title="Delete User"
                              >
                                <Icons.Trash />
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>You</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Business Info Section */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h3 className="dashboard-section-title">Business Information</h3>
              </div>
              <div className="dashboard-section-body">
                <div className="form-grid" style={{ gap: '16px' }}>
                  <div className="input-group">
                    <label>Business Name</label>
                    <input type="text" className="input" value={currentBusiness?.name || ''} disabled />
                  </div>
                  <div className="input-group">
                    <label>Phone</label>
                    <input type="text" className="input" value={currentBusiness?.phone || ''} disabled />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" className="input" value={currentBusiness?.email || ''} disabled />
                  </div>
                  <div className="input-group">
                    <label>Address</label>
                    <input type="text" className="input" value={currentBusiness?.address || 'Not provided'} disabled />
                  </div>
                </div>
              </div>
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
        business={currentBusiness}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSave={(userData) => {
          const success = onAddUser(userData);
          if (success) {
            setShowAddUserModal(false);
          }
        }}
      />

      {/* Product Detail Modal */}
      {showProductDetail && viewingProduct && (
        <div className="modal-overlay active" onClick={() => setShowProductDetail(false)}>
          <div className="modal product-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="modal-close" onClick={() => setShowProductDetail(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="product-detail-content">
                {/* Product Image */}
                <div className="product-detail-image">
                  <img src={viewingProduct.image} alt={viewingProduct.name} />
                  <div className={`product-detail-status ${viewingProduct.stock <= 0 ? 'out-of-stock' : viewingProduct.stock <= 10 ? 'low-stock' : 'in-stock'}`}>
                    {viewingProduct.stock <= 0 ? 'Out of Stock' : viewingProduct.stock <= 10 ? 'Low Stock' : 'In Stock'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="product-detail-info">
                  <h2 className="product-detail-name">{viewingProduct.name}</h2>
                  <div className="product-detail-sku">SKU: {viewingProduct.sku}</div>

                  <div className="product-detail-category">
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: `${categories.find(c => c.id === viewingProduct.category_id)?.color}20`,
                        color: categories.find(c => c.id === viewingProduct.category_id)?.color
                      }}
                    >
                      {viewingProduct.category_name}
                    </span>
                  </div>

                  <div className="product-detail-pricing">
                    <div className="pricing-item">
                      <span className="pricing-label">Selling Price</span>
                      <span className="pricing-value">₦{viewingProduct.price.toLocaleString()}</span>
                    </div>
                    <div className="pricing-item">
                      <span className="pricing-label">Cost Price</span>
                      <span className="pricing-value cost">₦{viewingProduct.cost.toLocaleString()}</span>
                    </div>
                    <div className="pricing-item">
                      <span className="pricing-label">Profit Margin</span>
                      <span className="pricing-value profit">
                        ₦{(viewingProduct.price - viewingProduct.cost).toLocaleString()}
                        <small> ({((viewingProduct.price - viewingProduct.cost) / viewingProduct.price * 100).toFixed(1)}%)</small>
                      </span>
                    </div>
                  </div>

                  <div className="product-detail-stock">
                    <div className="stock-level">
                      <span className="stock-label">Current Stock</span>
                      <span className={`stock-value ${viewingProduct.stock <= 0 ? 'out' : viewingProduct.stock <= 10 ? 'low' : 'good'}`}>
                        {viewingProduct.stock} units
                      </span>
                    </div>
                    <div className="stock-info">
                      <span className="stock-label">Stock Value</span>
                      <span className="stock-value">₦{(viewingProduct.stock * viewingProduct.cost).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="product-detail-date">
                    <span className="date-label">Added on:</span>
                    <span className="date-value">{new Date(viewingProduct.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer product-detail-actions">
              <button
                className="btn btn-secondary"
                onClick={() => { setShowProductDetail(false); setEditingProduct(viewingProduct); setShowModal(true); }}
              >
                <Icons.Edit /> Edit Product
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleShowQR(viewingProduct)}
              >
                <Icons.QrCode /> Show QR Code
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { addToCart(viewingProduct); setShowProductDetail(false); setActiveView('pos'); }}
                disabled={viewingProduct.stock <= 0}
              >
                <Icons.ShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <div className="nav-indicator"></div>
          <Icons.Dashboard />
          <span>Home</span>
        </button>
        <button
          className={`mobile-nav-item ${activeView === 'products' ? 'active' : ''}`}
          onClick={() => setActiveView('products')}
        >
          <div className="nav-indicator"></div>
          <Icons.Package />
          <span>Products</span>
        </button>
        <button
          className={`mobile-nav-item ${activeView === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveView('pos')}
        >
          <div className="nav-indicator"></div>
          <Icons.ShoppingCart />
          <span>POS</span>
        </button>
        <button
          className={`mobile-nav-item ${activeView === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveView('sales')}
        >
          <div className="nav-indicator"></div>
          <Icons.Receipt />
          <span>Sales</span>
        </button>
        <button
          className={`mobile-nav-item ${activeView === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveView('categories')}
        >
          <div className="nav-indicator"></div>
          <Icons.Tags />
          <span>More</span>
        </button>
      </nav>
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
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

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

  const handleBarcodeScan = (barcode: string) => {
    setFormData({ ...formData, sku: barcode });
    setShowBarcodeScanner(false);
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    value={formData.sku || ''}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU or scan barcode"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={() => setShowBarcodeScanner(true)}
                    title="Scan Barcode"
                  >
                    <Icons.Camera />
                  </button>
                </div>
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

        {/* Barcode Scanner */}
        <BarcodeScanner
          isOpen={showBarcodeScanner}
          onClose={() => setShowBarcodeScanner(false)}
          onScan={handleBarcodeScan}
        />
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
  sale,
  business
}: {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  business: Business | null;
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
            {/* Receipt Header - Business Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#000' }}>{business?.name || 'StockFlow Store'}</h2>
              {business?.address && (
                <p style={{ margin: '5px 0', fontSize: '12px' }}>{business.address}</p>
              )}
              {business?.phone && (
                <p style={{ margin: '5px 0', fontSize: '12px' }}>Tel: {business.phone}</p>
              )}
              {business?.email && (
                <p style={{ margin: '5px 0', fontSize: '12px' }}>{business.email}</p>
              )}
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

// Barcode Scanner Component (for adding products)
function BarcodeScanner({
  isOpen,
  onClose,
  onScan
}: {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          'barcode-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [
              // QR Code
              0,
              // Common 1D Barcodes
              8,  // CODE_128
              7,  // CODE_39
              13, // EAN_13
              14, // EAN_8
              15, // UPC_A
              16, // UPC_E
            ]
          },
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Scan Product Barcode</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Position the barcode within the camera view to scan
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Supports QR codes, EAN, UPC, CODE_128, CODE_39
            </p>
          </div>
          <div id="barcode-reader" style={{ width: '100%' }}></div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Add User Modal Component
function AddUserModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; password: string; role: 'admin' | 'user' }) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'admin' | 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSave({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Add New User</h3>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter user's full name"
                  required
                />
              </div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Email Address *</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter user's email"
                  required
                />
              </div>
              <div className="input-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create password"
                  required
                  minLength={6}
                />
              </div>
              <div className="input-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  className="input"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label>Role *</label>
                <select
                  className="input select"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                >
                  <option value="user">User - Basic access, can make sales</option>
                  <option value="admin">Admin - Full access except user management</option>
                </select>
              </div>
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>Role Permissions:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li><strong>User:</strong> Point of Sale, View Products, View Sales</li>
                <li><strong>Admin:</strong> All features except Settings/User Management</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add User</button>
          </div>
        </form>
      </div>
    </div>
  );
}
