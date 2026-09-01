import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100vh' }}>
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="text-danger page-title">403 Forbidden</h1>
        <p className="text-muted">You do not have permission to access this page.</p>
        <button onClick={() => window.location.href = '/'} className="btn btn-primary">Go Back</button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
