import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogOut,
  X,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const ManagerSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const [assignedModules, setAssignedModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await api.get('/modules');
        setAssignedModules(res.data.data);
      } catch (err) {
        console.error('Failed to fetch assigned modules', err);
      }
    };
    fetchModules();
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar Content */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo" style={{ backgroundColor: 'var(--color-success)' }}><Briefcase size={18} /></div>
            <span className="brand-text">Manager Portal</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink 
                to="/manager/dashboard" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <LayoutDashboard size={20} className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            
            <div className="nav-heading" style={{ padding: '1rem 1.5rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
              My Modules
            </div>
            
            {assignedModules.map((module) => (
              <li key={module._id} className="nav-item">
                <NavLink 
                  to={`/manager/modules/${module.slug}`} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                >
                  <span className="nav-icon" style={{ display: 'inline-flex', width: '20px', justifyContent: 'center' }}>{module.icon || '📦'}</span>
                  <span>{module.name}</span>
                </NavLink>
              </li>
            ))}
            
            {assignedModules.length === 0 && (
              <li className="nav-item" style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No modules assigned.
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link logout-btn w-full" onClick={logout}>
            <LogOut size={20} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ManagerSidebar;
