import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Modules from './pages/admin/Modules';
import Managers from './pages/admin/Managers';
import Permissions from './pages/admin/Permissions';

import ManagerLogin from './pages/manager/ManagerLogin';
import ManagerLayout from './layouts/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ModulePage from './pages/manager/ModulePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/" element={<Navigate to="/manager/login" replace />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="modules" element={<Modules />} />
              <Route path="managers" element={<Managers />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
            </Route>
          </Route>

          {/* Protected Manager Routes */}
          <Route path="/manager" element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route element={<ManagerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="modules/:slug" element={<ModulePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/manager/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
