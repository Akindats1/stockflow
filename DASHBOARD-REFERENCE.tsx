// ============================================
// DASHBOARD VIEW - MODERN REDESIGN
// Replace lines 474-575 in page.tsx with this
// ============================================

{/* Dashboard View */ }
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
                            <Icons.Tag />
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
