import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function Orders({ apiBaseUrl, token, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to load orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Helper to determine status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Processing': return 'badge-info';
      case 'Shipped': return 'badge-info';
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  // Timeline rendering helper
  const renderTimeline = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    
    // If cancelled, show unique status card instead of timeline
    if (status === 'Cancelled') {
      return (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontWeight: 600,
          border: '1.5px dashed var(--danger)'
        }}>
          This order has been cancelled.
        </div>
      );
    }

    const currentIndex = steps.indexOf(status);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1.5rem 0' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Delivery Status Tracker
        </span>
        <div className="timeline">
          <div className="timeline-progress" style={{ 
            width: `${(currentIndex / (steps.length - 1)) * 100}%` 
          }}></div>
          
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const isFuture = idx > currentIndex;

            let nodeIcon = <Clock size={12} />;
            if (step === 'Processing') nodeIcon = <Clock size={12} />;
            else if (step === 'Shipped') nodeIcon = <Truck size={12} />;
            else if (step === 'Delivered') nodeIcon = <CheckCircle size={12} />;

            return (
              <div 
                key={step} 
                className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="timeline-node">
                  {isCompleted ? <CheckCircle size={16} /> : nodeIcon}
                </div>
                <span className="timeline-label">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
        <p>Loading your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
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
          <ClipboardList size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>No Orders Found</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
          You haven't placed any orders yet. Visit the catalog to find items and try checking out!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Your Orders</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Track delivery progress, view summaries, and check order item details
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={order.id} className="glass" style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition-normal)'
            }}>
              {/* Order Header Summary Row */}
              <div 
                onClick={() => toggleExpandOrder(order.id)}
                style={{
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  {/* Order ID */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase' }}>
                      Order ID
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      #000{order.id}
                    </span>
                  </div>

                  {/* Date */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase' }}>
                      Date Placed
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--primary)" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Total */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase' }}>
                      Total Amount
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center' }}>
                      <DollarSign size={14} />
                      {parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                      Status
                    </span>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </span>
                  <button className="btn btn-icon" style={{ borderRadius: '50%', padding: '0.35rem' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Order Detail Section (Expandable) */}
              {isExpanded && (
                <div style={{
                  padding: '2rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {/* Status Progress Tracker Timeline */}
                  {renderTimeline(order.status)}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Order Items
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {order.OrderItems && order.OrderItems.map((item) => (
                          <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <img
                              src={item.Product ? item.Product.image : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'}
                              alt={item.Product ? item.Product.name : 'Product'}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)'
                              }}
                            />
                            <div style={{ flexGrow: 1 }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                {item.Product ? item.Product.name : 'Unknown Product'}
                              </h4>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Billing Address details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Shipping Address
                      </span>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        lineHeight: '1.5'
                      }}>
                        <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{order.shippingAddress}</span>
                      </div>

                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                        Payment Details
                      </span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>Method: <strong style={{ color: 'white' }}>{order.paymentMethod} (Simulated)</strong></div>
                        <div>Status: <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{order.paymentStatus}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
