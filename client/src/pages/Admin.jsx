import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ShieldCheck, DollarSign, ShoppingBag, ClipboardCheck, Users, Layers, ExternalLink } from 'lucide-react';

export default function Admin({ apiBaseUrl, token, showToast }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    image: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch(`${apiBaseUrl}/api/products`);
      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodData = await prodRes.ok ? await prodRes.json() : [];
      setProducts(prodData);

      // Fetch Orders (Admin headers)
      const ordRes = await fetch(`${apiBaseUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!ordRes.ok) throw new Error('Failed to load orders');
      const ordData = await ordRes.json();
      setOrders(ordData);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Statistics Calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0);
  
  const totalSalesCount = orders.filter(o => o.status !== 'Cancelled').length;

  // Product CRUD
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setProductForm({
      id: null,
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      stock: 10,
      image: ''
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || ''
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || productForm.price === '' || !productForm.category) {
      showToast('Name, price and category are required', 'warning');
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      stock: parseInt(productForm.stock) || 0,
      image: productForm.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'
    };

    const url = isEditing 
      ? `${apiBaseUrl}/api/products/${productForm.id}`
      : `${apiBaseUrl}/api/products`;
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Operation failed');

      showToast(isEditing ? 'Product updated successfully' : 'Product created successfully', 'success');
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete product');

      showToast('Product deleted successfully', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Order Status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update order status');

      showToast(`Order #${orderId} marked as ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Admin Title Card */}
      <div className="glass" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 2rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--primary)" />
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Monitor sales revenue, handle orders fulfillment, and update store catalog listings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Manage Catalog
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Fulfillment Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Dashboard Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Stat 1 */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Orders Fulfilled</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalSalesCount} Sales</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Catalog Items</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{products.length} Products</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Demo Base</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Registered</span>
          </div>
        </div>
      </div>

      {/* Main Tab content Area */}
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '25vh',
          gap: '1rem',
          color: 'var(--color-text-muted)'
        }}>
          <span className="spinner" style={{ width: '40px', height: '40px', color: 'var(--primary)' }}></span>
          <p>Loading dashboard records...</p>
        </div>
      ) : activeTab === 'products' ? (
        /* Products Catalog CRUD Dashboard */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Catalog Listing Directory</h3>
            <button 
              onClick={handleOpenAddModal} 
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Levels</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-base)'
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '280px' }}>
                        {product.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 600, 
                        color: product.stock === 0 ? 'var(--danger)' : product.stock <= 5 ? 'var(--warning)' : 'var(--accent)'
                      }}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenEditModal(product)} 
                          className="btn btn-icon" 
                          style={{ padding: '0.4rem' }}
                          title="Edit Product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="btn btn-icon" 
                          style={{ padding: '0.4rem', color: 'var(--danger)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Orders Fulfillment Admin Dashboard */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Customer Transactions & Shipments</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Date Placed</th>
                  <th>Shipping Address</th>
                  <th>Total Amount</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800 }}>#000{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.User ? order.User.username : 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.User ? order.User.email : ''}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.shippingAddress}>
                      {order.shippingAddress}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="input-control"
                        style={{
                          padding: '0.25rem 0.5rem',
                          height: 'auto',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          width: '120px',
                          borderColor: order.status === 'Delivered' ? 'var(--accent)' : order.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)',
                          color: order.status === 'Delivered' ? '#34d399' : order.status === 'Cancelled' ? '#f87171' : '#fbbf24',
                          backgroundColor: 'rgba(0,0,0,0.2)'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product ADD / EDIT Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isEditing ? 'Modify Catalog Product' : 'Add New Product to Catalog'}
              </h2>
              <button 
                onClick={() => setShowProductModal(false)}
                className="btn btn-icon"
                style={{ borderRadius: '50%', padding: '0.25rem' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Mechanical Gaming Keyboard"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="input-control"
                    placeholder="Provide full description of features and specs..."
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input-control"
                      placeholder="e.g. 129.00"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Inventory Stock</label>
                    <input
                      type="number"
                      min="0"
                      className="input-control"
                      placeholder="e.g. 10"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="input-control"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="https://..."
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  {isEditing ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
