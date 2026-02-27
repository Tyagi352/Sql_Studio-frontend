import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Database, AlertCircle } from 'lucide-react';
import '../../styles/components/_auth.scss';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setApiError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1>Create account</h1>
          <p>Start learning SQL today — it's free</p>
        </div>

        {apiError && (
          <div className="error-alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Arnav Tyagi' },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
            { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            { id: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
          ].map(({ id, label, type, placeholder }) => (
            <div className="field" key={id}>
              <label className="field__label" htmlFor={id}>{label}</label>
              <input
                id={id} name={id} type={type} placeholder={placeholder}
                className={`field__input${errors[id] ? ' field__input--error' : ''}`}
                value={form[id]}
                onChange={handleChange}
              />
              {errors[id] && <span className="field__error">{errors[id]}</span>}
            </div>
          ))}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</>
            ) : 'Create Account'}
          </button>

          <div className="auth-form__footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
