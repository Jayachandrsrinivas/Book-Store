import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem 2rem' }}>
          <ShieldAlert size={64} color="var(--accent-danger)" style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You do not have the required permissions to view this section of BookStore.
          </p>
          <a href="/" className="btn btn-primary">Return Home</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
