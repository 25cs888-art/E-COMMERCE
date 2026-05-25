import React from 'react';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, LogIn, Minus, Plus } from 'lucide-react';

export default function Cart({ 
  user, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onNavigate,
  loading 
}) {
  
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.Product ? parseFloat(item.Product.price) : 0;
    return acc + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08; // 8% sales tax
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: '1rem',
        color: 'var(--color-text-muted)'
      }}>
        <span className="spinner" style={{ width: '40px', height: '40px', color: 'var(--primary)' }}></span>
        <p>Updating your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="glass" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '5rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <div style={{
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '1.25rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShoppingCart size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
          Looks like you haven't added anything to your cart yet. Head back to the store catalog to find your favorite products.
        </p>
        <button 
          onClick={() => onNavigate('shop')} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Shopping Cart</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Manage items, adjust quantities, and complete your checkout
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        alignItems: 'start'
      }} className="cart-grid-responsive">
        {/* CSS workaround inside JS for responsive grid */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 1024px) {
            .cart-grid-responsive {
              grid-template-columns: 2.2fr 1.2fr !important;
            }
          }
        `}} />

        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
            </span>
            <button 
              onClick={onClearCart} 
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => {
              const product = item.Product;
              if (!product) return null;

              return (
                <div key={item.id || item.productId} className="glass" style={{
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  border: '1.5px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap'
                }}>
                  {/* Product Image */}
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border-color)'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Product Title / Price */}
                  <div style={{ flexGrow: 1, minWidth: '150px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => onNavigate('product-detail', product)}>
                      {product.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {product.category}
                    </span>
                    <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                      ${parseFloat(product.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Editor */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(0,0,0,0.2)'
                  }}>
                    <button
                      onClick={() => onUpdateQuantity(product.id, item.quantity - 1)}
                      style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: 'white' }}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, item.quantity + 1)}
                      style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: 'white' }}
                      disabled={item.quantity >= product.stock}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Total & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '120px', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total</span>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        ${(parseFloat(product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(product.id)}
                      className="btn btn-icon"
                      style={{ color: 'var(--danger)', borderColor: 'transparent', padding: '0.5rem' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Side Card */}
        <div className="glass" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Order Summary</h2>

          {/* Pricing breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Estimated Shipping</span>
              <span style={{ fontWeight: 600 }}>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Estimated Tax (8%)</span>
              <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{
              height: '1px',
              backgroundColor: 'var(--border-color)',
              margin: '0.5rem 0'
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total</span>
              <span className="gradient-text">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          {user ? (
            <button
              onClick={() => onNavigate('checkout')}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => onNavigate('auth')}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogIn size={16} />
                Sign In to Checkout
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                You must have an account to place and track orders.
              </p>
            </div>
          )}

          <button 
            onClick={() => onNavigate('shop')}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={14} /> Keep Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
