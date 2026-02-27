import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import './styles/main.scss';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#080c18' }}>
      <div className="spinner spinner--lg" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Public route (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index                  element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/assignments"    element={<Assignments />} />
        <Route path="/practice/:id"   element={<Practice />} />
        <Route path="/progress"       element={<Progress />} />
        <Route path="/leaderboard"    element={<Leaderboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a2035',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a2035' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a2035' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
