import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [assignedModules, setAssignedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await api.get('/modules');
        setAssignedModules(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to load your assigned modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="page-description">Here is your assigned CRM workspace</p>
        </div>
      </div>
      
      {error && (
        <div className="card mb-6 border-red-200">
          <div className="card-body bg-red-50 text-danger rounded-md">
            {error}
          </div>
        </div>
      )}

      <div className="card mb-8">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div style={{ backgroundColor: 'var(--color-success)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
              <Package size={24} />
            </div>
            <div>
              <p className="text-muted text-sm font-medium">Assigned Modules</p>
              <h2 className="text-2xl font-bold m-0 leading-tight">{assignedModules.length}</h2>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-4">Quick Access</h3>
      
      {assignedModules.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="text-muted mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold text-lg text-muted">No Modules Assigned</h3>
          <p className="text-muted mt-1 text-sm">Please contact your administrator to get access to CRM modules.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {assignedModules.map(module => (
            <Link 
              key={module._id}
              to={`/manager/modules/${module.slug}`}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit', transition: 'transform var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontSize: '1.5rem' }}>{module.icon || '📦'}</span>
                  <h3 className="font-semibold text-lg m-0">{module.name}</h3>
                </div>
                <p className="text-muted text-sm m-0 line-clamp-2">{module.description || `Manage your ${module.name.toLowerCase()} data.`}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
