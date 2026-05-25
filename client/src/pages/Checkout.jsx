import React, { useState } from 'react';
import { CreditCard, Truck, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Checkout({ 
  user, 
  cartItems, 
  onCheckout, 
  onNavigate, 
  loading 
}) {
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user ? user.username : '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '4111 2222 3333 4444',
    cardName: user ? user.username.toUpperCase() : '',
    expiry: '12/28',
    cvv: '123'
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.Product ? parseFloat(item.Product.price) : 0;
    return acc + (price * item.quantity);
  }, 0);

  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country) {
      alert('Please fill in all shipping fields');
      return;
    }

    const fullAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}, ${shippingInfo.country}`;
    onCheckout(fullAddress);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back Button */}
      <div>
        <button 
          onClick={() => onNavigate('cart')} 
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
        >
          <ArrowLeft size={16} /> Return to Cart
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        alignItems: 'start'
      }} className="checkout-grid-responsive">
        
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 1024px) {
            .checkout-grid-responsive {
              grid-template-columns: 1.8fr 1.2fr !important;
            }
          }
        `}} />

        {/* Checkout Forms (Shipping & Payment) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Shipping Form */}
          <div className="glass" style={{
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary)" />
              Shipping Information
            </h2>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                className="input-control"
                value={shippingInfo.fullName}
                onChange={handleShippingChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                className="input-control"
                placeholder="123 Main St, Apt 4B"
                value={shippingInfo.address}
                onChange={handleShippingChange}
                required
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem'
            }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="input-control"
                  placeholder="New York"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  className="input-control"
                  placeholder="10001"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  className="input-control"
                  placeholder="United States"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="glass" style={{
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="var(--primary)" />
              Payment Details (Simulated)
            </h2>

            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                className="input-control"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardName"
                className="input-control"
                value={paymentInfo.cardName}
                onChange={handlePaymentChange}
                required
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="text"
                  name="expiry"
                  className="input-control"
                  placeholder="MM/YY"
                  value={paymentInfo.expiry}
                  onChange={handlePaymentChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  name="cvv"
                  className="input-control"
                  placeholder="•••"
                  value={paymentInfo.cvv}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <ShieldCheck size={16} />
              Secured simulated sandbox checkout. No actual money will be charged.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? (
              <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
            ) : (
              <>
                Place Order — ${total.toFixed(2)}
              </>
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="glass" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Order Review</h2>

          {/* Cart item summary list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img
                  src={item.Product.image}
                  alt={item.Product.name}
                  style={{
                    width: '45px',
                    height: '45px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                />
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'inline-block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.Product.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Qty: {item.quantity} × ${parseFloat(item.Product.price).toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  ${(parseFloat(item.Product.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
              <span style={{ fontWeight: 600 }}>${shipping.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Tax (8%)</span>
              <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
              <span>Total</span>
              <span className="gradient-text">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
