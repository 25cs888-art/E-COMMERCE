import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Auth({ apiBaseUrl, onAuthSuccess, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isAdminChecked: false // Checkbox to register as an admin for development/testing ease
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password,
          role: formData.isAdminChecked ? 'admin' : 'user'
        };

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      showToast(isLogin ? 'Welcome back!' : 'Account registered successfully!', 'success');
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '1rem'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Sign up to start shopping and tracking orders'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="input-control"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="email"
                id="email"
                name="email"
                className="input-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="password"
                id="password"
                name="password"
                className="input-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-color)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <input
                type="checkbox"
                id="isAdminChecked"
                name="isAdminChecked"
                checked={formData.isAdminChecked}
                onChange={handleChange}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="isAdminChecked" style={{ 
                margin: 0, 
                cursor: 'pointer', 
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: formData.isAdminChecked ? 'var(--primary)' : 'var(--color-text-muted)'
              }}>
                <ShieldCheck size={14} />
                Register as Admin (For Demo Testing)
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? (
              <span className="spinner" style={{ width: '18px', height: '18px' }}></span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          color: 'var(--color-text-muted)'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => setIsLogin(!isLogin)}
            style={{ 
              color: 'var(--primary)', 
              fontWeight: 600, 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  );
}
