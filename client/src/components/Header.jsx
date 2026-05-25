import React from 'react';
import { ShoppingBag, ShoppingCart, User, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';

export default function Header({ user, currentView, onNavigate, cartCount, onLogout }) {
  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(12px)',
      background: 'rgba(21, 28, 44, 0.8)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo */}
        <div 
          onClick={() => onNavigate('shop')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <span style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 50%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ApexShop
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span 
            onClick={() => onNavigate('shop')}
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: currentView === 'shop' ? 'var(--primary)' : 'var(--color-text-muted)',
              transition: 'var(--transition-fast)'
            }}
          >
            Catalog
          </span>

          {user && (
            <span 
              onClick={() => onNavigate('orders')}
              style={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: currentView === 'orders' ? 'var(--primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition-fast)'
              }}
            >
              <ClipboardList size={16} />
              Orders
            </span>
          )}

          {user && user.role === 'admin' && (
            <span 
              onClick={() => onNavigate('admin')}
              style={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: currentView === 'admin' ? 'var(--primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition-fast)'
              }}
            >
              <LayoutDashboard size={16} />
              Admin Panel
            </span>
          )}
        </nav>

        {/* Actions (Cart, User, Logout) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Cart Icon */}
          <div 
            onClick={() => onNavigate('cart')}
            style={{ 
              position: 'relative', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              backgroundColor: currentView === 'cart' ? 'var(--primary-light)' : 'rgba(255,255,255,0.03)',
              color: currentView === 'cart' ? 'var(--primary)' : 'var(--color-text-muted)',
              transition: 'var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="cart-icon-btn"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 5px rgba(99,102,241,0.5)'
              }}>
                {cartCount}
              </span>
            )}
          </div>

          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>

          {/* User Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: user.role === 'admin' ? 'var(--primary)' : 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.05em'
                }}>
                  {user.role}
                </span>
              </div>
              <button 
                onClick={onLogout}
                className="btn btn-icon"
                title="Log Out"
                style={{ borderRadius: '50%' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('auth')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
