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
  // Food & Groceries
  { id: 1, name: 'Golden Penny Semovita 1kg', sku: 'GP-SEM-001', category_id: 3, category_name: 'Food & Drinks', price: 1250, cost: 900, stock: 80, image: '/images/products/semovita.png', created_at: new Date().toISOString() },
  { id: 2, name: 'Uncle Ben\'s Parboiled Rice 50kg', sku: 'UB-RICE-50', category_id: 3, category_name: 'Food & Drinks', price: 42000, cost: 38000, stock: 25, image: '/images/products/rice-bag.png', created_at: new Date().toISOString() },
  { id: 3, name: 'Honeywell Wheat Flour 2kg', sku: 'HW-FLR-002', category_id: 3, category_name: 'Food & Drinks', price: 2100, cost: 1600, stock: 60, image: '/images/products/wheat-flour.png', created_at: new Date().toISOString() },
  { id: 4, name: 'Ijebu Garri 1.5kg', sku: 'IJ-GAR-015', category_id: 3, category_name: 'Food & Drinks', price: 850, cost: 600, stock: 120, image: '/images/products/garri.png', created_at: new Date().toISOString() },
  { id: 5, name: 'Peak Powdered Milk 900g', sku: 'PK-MLK-900', category_id: 3, category_name: 'Food & Drinks', price: 4500, cost: 3800, stock: 45, image: '/images/products/peak-milk.png', created_at: new Date().toISOString() },
  { id: 6, name: 'Mama Gold Rice 25kg', sku: 'MG-RICE-25', category_id: 3, category_name: 'Food & Drinks', price: 21500, cost: 19000, stock: 18, image: '/images/products/mama-gold-rice.png', created_at: new Date().toISOString() },

  // Beverages
  { id: 7, name: 'Malta Guinness Can 33cl', sku: 'MG-CAN-033', category_id: 3, category_name: 'Food & Drinks', price: 350, cost: 250, stock: 200, image: '/images/products/malta-guinness.png', created_at: new Date().toISOString() },
  { id: 8, name: 'Coca-Cola 50cl Pet Bottle', sku: 'CC-PET-050', category_id: 3, category_name: 'Food & Drinks', price: 300, cost: 200, stock: 150, image: '/images/products/coca-cola.png', created_at: new Date().toISOString() },
  { id: 9, name: 'Milo Activ-Go 400g', sku: 'ML-ACT-400', category_id: 3, category_name: 'Food & Drinks', price: 1850, cost: 1400, stock: 55, image: '/images/products/milo.png', created_at: new Date().toISOString() },
  { id: 10, name: 'Bournvita 500g', sku: 'BV-500', category_id: 3, category_name: 'Food & Drinks', price: 2200, cost: 1700, stock: 40, image: '/images/products/bournvita.png', created_at: new Date().toISOString() },

  // Clothing & Fashion
  { id: 11, name: 'Ankara Fabric 6 Yards', sku: 'ANK-FAB-006', category_id: 2, category_name: 'Clothing', price: 4500, cost: 3000, stock: 35, image: '/images/products/ankara-fabric.png', created_at: new Date().toISOString() },
  { id: 12, name: 'Adire Tie-Dye Shirt', sku: 'ADR-SHT-001', category_id: 2, category_name: 'Clothing', price: 5500, cost: 3500, stock: 20, image: '/images/products/adire-shirt.png', created_at: new Date().toISOString() },
  { id: 13, name: 'Agbada Complete Set', sku: 'AGB-SET-001', category_id: 2, category_name: 'Clothing', price: 25000, cost: 18000, stock: 8, image: '/images/products/agbada.png', created_at: new Date().toISOString() },
  { id: 14, name: 'Gele (Head Tie)', sku: 'GEL-HT-001', category_id: 2, category_name: 'Clothing', price: 2500, cost: 1500, stock: 50, image: '/images/products/gele.png', created_at: new Date().toISOString() },

  // Electronics
  { id: 15, name: 'itel Mobile Phone A60', sku: 'ITL-A60', category_id: 1, category_name: 'Electronics', price: 45000, cost: 38000, stock: 15, image: '/images/products/itel-phone.png', created_at: new Date().toISOString() },
  { id: 16, name: 'Oraimo Power Bank 10000mAh', sku: 'ORM-PB-10K', category_id: 1, category_name: 'Electronics', price: 8500, cost: 6000, stock: 30, image: '/images/products/power-bank.png', created_at: new Date().toISOString() },
  { id: 17, name: 'Rechargeable Fan 18"', sku: 'RF-18-001', category_id: 1, category_name: 'Electronics', price: 22000, cost: 17000, stock: 12, image: '/images/products/rechargeable-fan.png', created_at: new Date().toISOString() },

  // Health & Beauty
  { id: 18, name: 'Dettol Antiseptic 500ml', sku: 'DET-ANT-500', category_id: 5, category_name: 'Health & Beauty', price: 1800, cost: 1200, stock: 70, image: '/images/products/dettol.png', created_at: new Date().toISOString() },
  { id: 19, name: 'Dudu Osun Black Soap', sku: 'DDO-BLK-001', category_id: 5, category_name: 'Health & Beauty', price: 650, cost: 400, stock: 95, image: '/images/products/dudu-osun.png', created_at: new Date().toISOString() },
  { id: 20, name: 'Ori (Shea Butter) 500g', sku: 'ORI-SB-500', category_id: 5, category_name: 'Health & Beauty', price: 1200, cost: 800, stock: 60, image: '/images/products/shea-butter.png', created_at: new Date().toISOString() },

  // Home & Garden
  { id: 21, name: 'Cooking Gas Cylinder 6kg', sku: 'CGC-06KG', category_id: 4, category_name: 'Home & Garden', price: 11500, cost: 9500, stock: 10, image: '/images/products/gas-cylinder.png', created_at: new Date().toISOString() },
  { id: 22, name: 'Aba Made Shoes (Men)', sku: 'ABA-SH-M01', category_id: 2, category_name: 'Clothing', price: 7500, cost: 5000, stock: 25, image: '/images/products/aba-shoes.png', created_at: new Date().toISOString() },
  { id: 23, name: 'Plastic Cooler 50L', sku: 'PLC-CLR-50', category_id: 4, category_name: 'Home & Garden', price: 8500, cost: 6000, stock: 18, image: '/images/products/cooler.png', created_at: new Date().toISOString() },
  { id: 24, name: 'Indomie Noodles Carton (40 pcs)', sku: 'IND-NDL-C40', category_id: 3, category_name: 'Food & Drinks', price: 5200, cost: 4500, stock: 35, image: '/images/products/indomie.png', created_at: new Date().toISOString() },
  { id: 25, name: 'Palm Oil 5 Litres', sku: 'PLM-OIL-005', category_id: 3, category_name: 'Food & Drinks', price: 6500, cost: 5500, stock: 28, image: '/images/products/palm-oil.png', created_at: new Date().toISOString() },
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
            <div>
              <div className="page-header">
                <div className="page-title">
                  <h1>Products</h1>
                  <p>Manage your inventory</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-export" onClick={() => alert('Export functionality coming soon!')}>
                    <Icons.Download />
                    Export
                  </button>
                  <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
                    <Icons.Plus /> New Product
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="products-table-container">
                {/* Table Header Controls */}
                <div className="table-header-controls">
                  <div className="table-search-container">
                    <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
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
                    <button className="filter-toggle">
                      Filters
                      <span style={{ fontSize: '10px' }}>▾</span>
                    </button>
                  </div>
                  <div className="pos-categories" style={{ flex: '1', justifyContent: 'flex-start' }}>
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
                </div>

                {/* Products Table */}
                <table className="data-table-modern">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" className="table-checkbox" />
                      </th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <input type="checkbox" className="table-checkbox" />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="product-thumbnail"
                            />
                            <span style={{ fontWeight: 500 }}>{product.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                          }}>
                            {product.category_name}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{product.sku}</td>
                        <td style={{ fontWeight: 600 }}>₦{product.price.toFixed(2)}</td>
                        <td>{product.stock} units</td>
                        <td>
                          <span className={`status-badge ${product.stock <= 0 ? 'out-of-stock' : product.stock <= 10 ? 'low-stock' : 'active'}`}>
                            {product.stock <= 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-menu">
                            <button
                              className="action-menu-trigger"
                              onClick={(e) => {
                                e.stopPropagation();
                                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                                menu?.classList.toggle('active');
                              }}
                            >
                              ⋮
                            </button>
                            <div className="action-menu-dropdown">
                              <button
                                className="action-menu-item"
                                onClick={() => { setEditingProduct(product); setShowModal(true); }}
                              >
                                <Icons.Edit />
                                Edit
                              </button>
                              <button
                                className="action-menu-item"
                                onClick={() => handleShowQR(product)}
                              >
                                <Icons.QrCode />
                                QR Code
                              </button>
                              <button
                                className="action-menu-item danger"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Icons.Trash />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="empty-state" style={{ padding: '60px 20px' }}>
                    <Icons.Package />
                    <h3>No products found</h3>
                    <p>Try adjusting your search or add a new product</p>
                  </div>
                )}

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="pagination">
                    <button className="pagination-button" disabled>
                      ←
                    </button>
                    <button className="pagination-button active">1</button>
                    <button className="pagination-button">2</button>
                    <button className="pagination-button">3</button>
                    <span style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
                    <button className="pagination-button">{Math.ceil(filteredProducts.length / 10)}</button>
                    <button className="pagination-button">
                      →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        }

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
