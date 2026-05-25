import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Info, RefreshCw, Layers } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Accessories', 'Home & Kitchen'];

export default function Shop({ apiBaseUrl, onAddToCart, onViewProduct, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category !== 'All') queryParams.append('category', category);
      if (sort) queryParams.append('sort', sort);

      const response = await fetch(`${apiBaseUrl}/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner / Hero Section */}
      <div className="glass" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(21, 28, 44, 0.4) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }}></div>
        <span className="badge badge-info" style={{ width: 'fit-content' }}>NEW SEASON ARRIVALS</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15 }}>
          Elevate Your Daily Style & Gear
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', fontSize: '1.05rem' }}>
          Explore our curated selection of high-quality premium products with exceptional design, modern technologies, and sustainable organic materials.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass" style={{
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Categories Tab */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Form and Sorting */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '550px',
            marginLeft: 'auto'
          }}>
            <form onSubmit={handleSearchSubmit} style={{
              position: 'relative',
              flexGrow: 1,
              display: 'flex'
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="text"
                placeholder="Search products..."
                className="input-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  height: '42px'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  fontSize: '0.85rem',
                  height: '42px'
                }}
              >
                Search
              </button>
            </form>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-control"
              style={{
                width: '150px',
                height: '42px',
                padding: '0 0.75rem',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '30vh',
          gap: '1rem',
          color: 'var(--color-text-muted)'
        }}>
          <span className="spinner" style={{ width: '40px', height: '40px', color: 'var(--primary)' }}></span>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Layers size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem' }}>No products found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
            We couldn't find any products matching "{search}" in category "{category}". Try checking spelling or expanding filters.
          </p>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={14} /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="card-img-wrapper" onClick={() => onViewProduct(product)} style={{ cursor: 'pointer' }}>
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="card-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="badge badge-info" style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 10,
                  backdropFilter: 'blur(4px)',
                  background: 'rgba(99, 102, 241, 0.85)',
                  color: 'white'
                }}>
                  {product.category}
                </span>
                {product.stock === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(11, 15, 25, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20
                  }}>
                    <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>

              <div className="card-content">
                <div 
                  onClick={() => onViewProduct(product)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', cursor: 'pointer' }}
                >
                  <h3 className="card-title">{product.name}</h3>
                  <p className="card-description">{product.description}</p>
                </div>

                <div className="card-footer">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Price</span>
                    <span className="card-price">${parseFloat(product.price).toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onViewProduct(product)} 
                      className="btn btn-icon"
                      title="View Details"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={() => onAddToCart(product.id, 1)}
                      className="btn btn-primary btn-sm"
                      disabled={product.stock === 0}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        padding: '0.5rem 0.75rem'
                      }}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
