import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus, RefreshCw, Box } from 'lucide-react';

export default function ProductDetail({ product, onBack, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p>No product selected</p>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  const handleQuantityChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back Button */}
      <div>
        <button 
          onClick={onBack} 
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      {/* Detail Layout */}
      <div className="glass" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem'
        }}>
          {/* Product Image */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            aspectRatio: '1',
            backgroundColor: 'var(--bg-base)',
            border: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <span className="badge badge-info" style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 10,
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '0.35rem 0.75rem',
              backdropFilter: 'blur(4px)',
              background: 'rgba(99, 102, 241, 0.85)',
              color: 'white'
            }}>
              {product.category}
            </span>
          </div>

          {/* Product Details info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {product.name}
                </h1>
                
                {/* Stock Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Box size={14} color={isOutOfStock ? 'var(--danger)' : 'var(--accent)'} />
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: isOutOfStock ? 'var(--danger)' : 'var(--accent)' 
                  }}>
                    {isOutOfStock 
                      ? 'Out of Stock' 
                      : product.stock <= 5 
                        ? `Only ${product.stock} items left in stock!` 
                        : 'In Stock'}
                  </span>
                </div>
              </div>

              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 800, 
                color: '#ffffff',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem'
              }}>
                ${parseFloat(product.price).toFixed(2)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.7' }}>
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            </div>

            {/* Purchase Options */}
            <div className="glass" style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              backgroundColor: 'rgba(11, 15, 25, 0.4)'
            }}>
              {!isOutOfStock ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Select Quantity</span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1.5px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(0,0,0,0.2)'
                    }}>
                      <button 
                        onClick={() => handleQuantityChange(-1)} 
                        className="btn"
                        style={{ 
                          padding: '0.5rem 0.75rem', 
                          borderRadius: 0, 
                          backgroundColor: 'transparent',
                          color: quantity <= 1 ? 'rgba(255,255,255,0.1)' : 'white'
                        }}
                        disabled={quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>
                        {quantity}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(1)} 
                        className="btn"
                        style={{ 
                          padding: '0.5rem 0.75rem', 
                          borderRadius: 0, 
                          backgroundColor: 'transparent',
                          color: quantity >= product.stock ? 'rgba(255,255,255,0.1)' : 'white'
                        }}
                        disabled={quantity >= product.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      onClick={() => onAddToCart(product.id, quantity)}
                      className="btn btn-primary"
                      style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <ShoppingCart size={18} />
                      Add to Cart — ${(parseFloat(product.price) * quantity).toFixed(2)}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  className="btn btn-secondary"
                  disabled
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <RefreshCw size={18} />
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
