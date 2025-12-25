// ============================================
// PRODUCTS VIEW - TABLE LAYOUT
// Replace lines 577-675 in page.tsx with this
// ============================================

{/* Products View */ }
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
