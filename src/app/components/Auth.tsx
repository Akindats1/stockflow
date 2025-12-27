'use client';

import { useState } from 'react';

// Types
type UserRole = 'super_admin' | 'admin' | 'user';

export interface Business {
    id: number;
    name: string;
    phone: string;
    email: string;
    address?: string;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    business_id: number;
    created_at: string;
}

// Register Form Component
export function RegisterForm({
    onRegister,
    onSwitchToLogin
}: {
    onRegister: (business: { name: string; phone: string; email: string; address?: string }, user: { name: string; email: string; password: string }) => void;
    onSwitchToLogin: () => void;
}) {
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        onRegister(
            { name: businessName, phone, email, address: address || undefined },
            { name: userName, email, password }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-form-title">Register Your Business</h2>

            <div className="auth-section">
                <h3 className="auth-section-title">Business Information</h3>
                <div className="input-group">
                    <label>Business Name *</label>
                    <input
                        type="text"
                        className="input"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="Enter your business name"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        className="input"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+234 XXX XXX XXXX"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Email Address *</label>
                    <input
                        type="email"
                        className="input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="business@example.com"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Business Address (Optional)</label>
                    <textarea
                        className="input"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Enter your business address"
                        rows={2}
                    />
                </div>
            </div>

            <div className="auth-section">
                <h3 className="auth-section-title">Admin Account</h3>
                <div className="input-group">
                    <label>Your Name *</label>
                    <input
                        type="text"
                        className="input"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password *</label>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                        minLength={6}
                    />
                </div>
                <div className="input-group">
                    <label>Confirm Password *</label>
                    <input
                        type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
                Register Business
            </button>

            <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="auth-link" onClick={onSwitchToLogin}>
                    Login here
                </button>
            </p>
        </form>
    );
}

// Login Form Component
export function LoginForm({
    onLogin,
    onSwitchToRegister
}: {
    onLogin: (email: string, password: string) => void;
    onSwitchToRegister: () => void;
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-form-title">Welcome Back</h2>

            <div className="input-group">
                <label>Email Address</label>
                <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div className="input-group">
                <label>Password</label>
                <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
                Login
            </button>

            <p className="auth-switch">
                Don&apos;t have an account?{' '}
                <button type="button" className="auth-link" onClick={onSwitchToRegister}>
                    Register here
                </button>
            </p>
        </form>
    );
}

// Auth Screen Component
export function AuthScreen({
    authScreen,
    setAuthScreen,
    onRegister,
    onLogin,
    toasts
}: {
    authScreen: 'login' | 'register';
    setAuthScreen: (screen: 'login' | 'register') => void;
    onRegister: (business: { name: string; phone: string; email: string; address?: string }, user: { name: string; email: string; password: string }) => void;
    onLogin: (email: string, password: string) => void;
    toasts: { id: number; message: string; type: 'success' | 'error' | 'warning' }[];
}) {
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">S</div>
                        <span className="auth-logo-text">StockFlow</span>
                    </div>
                    <p className="auth-subtitle">Inventory Management System</p>
                </div>

                {authScreen === 'register' ? (
                    <RegisterForm
                        onRegister={onRegister}
                        onSwitchToLogin={() => setAuthScreen('login')}
                    />
                ) : (
                    <LoginForm
                        onLogin={onLogin}
                        onSwitchToRegister={() => setAuthScreen('register')}
                    />
                )}
            </div>

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

// Hook for authentication logic
export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authScreen, setAuthScreen] = useState<'login' | 'register'>('register');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Refresh users from localStorage
    const refreshUsers = () => {
        const savedUsers = localStorage.getItem('stockflow_users');
        if (savedUsers) {
            const parsedUsers = JSON.parse(savedUsers);
            setUsers(parsedUsers);
            return parsedUsers;
        }
        return [];
    };

    // Initialize from localStorage
    const initAuth = () => {
        const savedBusiness = localStorage.getItem('stockflow_business');
        const savedUser = localStorage.getItem('stockflow_user');
        const savedUsers = localStorage.getItem('stockflow_users');

        if (savedBusiness && savedUser) {
            setCurrentBusiness(JSON.parse(savedBusiness));
            setCurrentUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        }
        setIsLoading(false);
    };


    const handleRegisterBusiness = (
        businessData: { name: string; phone: string; email: string; address?: string },
        userData: { name: string; email: string; password: string }
    ) => {
        const newBusiness: Business = {
            id: Date.now(),
            ...businessData,
            created_at: new Date().toISOString(),
        };

        const newUser: User = {
            id: Date.now() + 1,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'super_admin',
            business_id: newBusiness.id,
            created_at: new Date().toISOString(),
        };

        setCurrentBusiness(newBusiness);
        setCurrentUser(newUser);
        setUsers([newUser]);
        setIsAuthenticated(true);

        localStorage.setItem('stockflow_business', JSON.stringify(newBusiness));
        localStorage.setItem('stockflow_user', JSON.stringify(newUser));
        localStorage.setItem('stockflow_users', JSON.stringify([newUser]));

        return { success: true, message: 'Business registered successfully! Welcome to StockFlow.' };
    };

    const handleLogin = (email: string, password: string) => {
        const savedUsers = localStorage.getItem('stockflow_users');
        const savedBusiness = localStorage.getItem('stockflow_business');

        if (savedUsers && savedBusiness) {
            const usersList: User[] = JSON.parse(savedUsers);
            const user = usersList.find(u => u.email === email && u.password === password);

            if (user) {
                setCurrentUser(user);
                setCurrentBusiness(JSON.parse(savedBusiness));
                setIsAuthenticated(true);
                localStorage.setItem('stockflow_user', JSON.stringify(user));
                return { success: true, message: `Welcome back, ${user.name}!` };
            }
            return { success: false, message: 'Invalid email or password' };
        }
        setAuthScreen('register');
        return { success: false, message: 'No account found. Please register first.' };
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentBusiness(null);
        setIsAuthenticated(false);
        localStorage.removeItem('stockflow_user');
        setAuthScreen('login');
        return { success: true, message: 'Logged out successfully' };
    };

    const handleAddUser = (userData: { name: string; email: string; password: string; role: 'admin' | 'user' }) => {
        const savedUsers = localStorage.getItem('stockflow_users');
        const usersList: User[] = savedUsers ? JSON.parse(savedUsers) : [];

        // Check if email already exists
        if (usersList.find(u => u.email === userData.email)) {
            return { success: false, message: 'A user with this email already exists' };
        }

        const newUser: User = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            business_id: currentBusiness?.id || 0,
            created_at: new Date().toISOString(),
        };

        const updatedUsers = [...usersList, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('stockflow_users', JSON.stringify(updatedUsers));

        return { success: true, message: `User ${userData.name} added successfully!` };
    };

    const handleDeleteUser = (userId: number) => {
        // Prevent deleting yourself
        if (currentUser?.id === userId) {
            return { success: false, message: 'You cannot delete your own account' };
        }

        const savedUsers = localStorage.getItem('stockflow_users');
        const usersList: User[] = savedUsers ? JSON.parse(savedUsers) : [];

        const updatedUsers = usersList.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('stockflow_users', JSON.stringify(updatedUsers));

        return { success: true, message: 'User deleted successfully' };
    };

    return {
        isAuthenticated,
        authScreen,
        setAuthScreen,
        currentUser,
        currentBusiness,
        users,
        isLoading,
        initAuth,
        refreshUsers,
        handleRegisterBusiness,
        handleLogin,
        handleLogout,
        handleAddUser,
        handleDeleteUser,
    };
}
