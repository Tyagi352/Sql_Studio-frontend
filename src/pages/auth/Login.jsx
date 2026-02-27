import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Database, AlertCircle, Eye, EyeOff } from 'lucide-react';
import '../../styles/components/_auth.scss';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-bounce-in">
        <div className="auth-card__brand">
          <div className="brand-icon">
            <Database size={24} color="white" />
          </div>
          <span className="brand-title">CipherSQL Studio</span>
        </div>

        <div className="auth-card__heading">
          <h1>Welcome back</h1>
          <p>Sign in to continue your SQL journey</p>
        </div>

        {error && (
          <div className="error-alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field__label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="field__input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="field__input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--color-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
            ) : 'Sign In'}
          </button>

          <div className="auth-form__footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
