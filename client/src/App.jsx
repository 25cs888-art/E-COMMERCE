import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';
import Auth from './pages/Auth.jsx';
import { AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('shop');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Handle toast notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Verify token and load user profile on boot
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(err => {
        handleLogout();
        showToast(err.message, 'warning');
      });
    }
  }, [token]);

  // Load Cart items
  useEffect(() => {
    if (user) {
      // Load from server database
      setCartLoading(true);
      fetch(`${API_BASE_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setCart(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Cart load error:', err))
      .finally(() => setCartLoading(false));
    } else {
      // Load guest cart from local storage
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        setCart(JSON.parse(guestCart));
      } else {
        setCart([]);
      }
    }
  }, [user, token]);

  const handleAuthSuccess = async (newToken, loggedUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedUser);

    // Merge Guest Cart to Database upon successful login
    const guestCart = localStorage.getItem('guest_cart');
    if (guestCart) {
      const items = JSON.parse(guestCart);
      if (items.length > 0) {
        showToast('Syncing guest items to your account...', 'info');
        for (const item of items) {
          try {
            await fetch(`${API_BASE_URL}/api/cart`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity
              })
            });
          } catch (e) {
            console.error('Failed to sync item:', item.productId, e);
          }
        }
        localStorage.removeItem('guest_cart');
      }
    }

    setCurrentView('shop');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setCart([]);
    setCurrentView('shop');
    showToast('Logged out successfully', 'info');
  };

  // Add Item to Cart
  const handleAddToCart = async (productId, quantity = 1) => {
    if (user) {
      // Save in server database
      setCartLoading(true);
      try {
        // Check if item already in cart to calculate total quantity
        const existingItem = cart.find(item => item.productId === productId);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const targetQty = currentQty + quantity;

        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: targetQty })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to add to cart');
        }

        // Refetch complete cart
        const cartRes = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartData = await cartRes.json();
        setCart(cartData);
        showToast('Cart updated!', 'success');
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setCartLoading(false);
      }
    } else {
      // Guest Cart LocalStorage Flow
      try {
        // Fetch product details first to display correctly
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        if (!response.ok) throw new Error('Product details fetch failed');
        const product = await response.json();

        const guestCart = localStorage.getItem('guest_cart');
        let items = guestCart ? JSON.parse(guestCart) : [];

        const existingItemIndex = items.findIndex(item => item.productId === productId);
        if (existingItemIndex > -1) {
          const newQty = items[existingItemIndex].quantity + quantity;
          if (product.stock < newQty) {
            throw new Error(`Insufficient stock. Only ${product.stock} items left.`);
          }
          items[existingItemIndex].quantity = newQty;
        } else {
          if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Only ${product.stock} items left.`);
          }
          items.push({
            id: `guest_${productId}_${Date.now()}`,
            productId,
            quantity,
            Product: product
          });
        }

        localStorage.setItem('guest_cart', JSON.stringify(items));
        setCart(items);
        showToast('Cart updated (guest)!', 'success');
      } catch (err) {
        showToast(err.message, 'danger');
      }
    }
  };

  // Update Cart quantity directly
  const handleUpdateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;
    
    if (user) {
      setCartLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: newQty })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update quantity');

        // Refetch complete cart
        const cartRes = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartData = await cartRes.json();
        setCart(cartData);
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setCartLoading(false);
      }
    } else {
      // Guest
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        let items = JSON.parse(guestCart);
        const itemIdx = items.findIndex(item => item.productId === productId);
        if (itemIdx > -1) {
          items[itemIdx].quantity = newQty;
          localStorage.setItem('guest_cart', JSON.stringify(items));
          setCart(items);
        }
      }
    }
  };

  // Remove single item from cart
  const handleRemoveItem = async (productId) => {
    if (user) {
      setCartLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to remove item');
        }
        setCart(prev => prev.filter(item => item.productId !== productId));
        showToast('Item removed', 'info');
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setCartLoading(false);
      }
    } else {
      // Guest
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        let items = JSON.parse(guestCart);
        items = items.filter(item => item.productId !== productId);
        localStorage.setItem('guest_cart', JSON.stringify(items));
        setCart(items);
        showToast('Item removed', 'info');
      }
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (user) {
      setCartLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to clear cart');
        setCart([]);
        showToast('Cart cleared', 'info');
      } catch (err) {
        showToast(err.message, 'danger');
      } finally {
        setCartLoading(false);
      }
    } else {
      localStorage.removeItem('guest_cart');
      setCart([]);
      showToast('Cart cleared', 'info');
    }
  };

  // Checkout order placement
  const handleCheckout = async (shippingAddress) => {
    setCheckoutLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      showToast('Order placed successfully!', 'success');
      setCart([]);
      setCurrentView('orders');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // State-based Routing Navigator
  const navigateTo = (view, data = null) => {
    if (view === 'product-detail') {
      setSelectedProduct(data);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Render view conditionally
  const renderView = () => {
    switch (currentView) {
      case 'shop':
        return (
          <Shop
            apiBaseUrl={API_BASE_URL}
            onAddToCart={handleAddToCart}
            onViewProduct={(product) => navigateTo('product-detail', product)}
            showToast={showToast}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            product={selectedProduct}
            onBack={() => navigateTo('shop')}
            onAddToCart={handleAddToCart}
          />
        );
      case 'cart':
        return (
          <Cart
            user={user}
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigate={navigateTo}
            loading={cartLoading}
          />
        );
      case 'checkout':
        return (
          <Checkout
            user={user}
            cartItems={cart}
            onCheckout={handleCheckout}
            onNavigate={navigateTo}
            loading={checkoutLoading}
          />
        );
      case 'orders':
        return (
          <Orders
            apiBaseUrl={API_BASE_URL}
            token={token}
            showToast={showToast}
          />
        );
      case 'admin':
        return (
          <Admin
            apiBaseUrl={API_BASE_URL}
            token={token}
            showToast={showToast}
          />
        );
      case 'auth':
        return (
          <Auth
            apiBaseUrl={API_BASE_URL}
            onAuthSuccess={handleAuthSuccess}
            showToast={showToast}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Banner Alerts */}
      {toast && (
        <div className="toast" style={{
          borderLeftColor: toast.type === 'success' ? 'var(--accent)' : toast.type === 'danger' ? 'var(--danger)' : 'var(--primary)'
        }}>
          {toast.type === 'success' ? (
            <CheckCircle size={18} color="var(--accent)" />
          ) : (
            <AlertCircle size={18} color={toast.type === 'danger' ? 'var(--danger)' : 'var(--primary)'} />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        user={user}
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={cartTotalItemsCount}
        onLogout={handleLogout}
      />

      {/* Main Pages Content */}
      <main>
        {renderView()}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p>&copy; {new Date().getFullYear()} ApexShop E-Commerce. All rights reserved.</p>
          <p style={{ opacity: 0.6 }}>Full-Stack SPA built with React (Vite), Express.js, and Sequelize.</p>
        </div>
      </footer>
    </div>
  );
}
