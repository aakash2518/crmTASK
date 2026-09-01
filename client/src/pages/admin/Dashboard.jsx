import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShieldCheck, Activity, Plus, Settings } from 'lucide-react';
import api from '../../services/api';

const StatCard = ({ title, value, icon: Icon, description, color, bgRgba, glowRgba }) => (
  <div className="card" style={{ transition: 'transform var(--transition-fast)' }} 
       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
       onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
    <div className="card-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>{title}</p>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.25rem', lineHeight: '1' }}>{value}</h3>
        </div>
        <div style={{ 
          padding: '1rem', 
          borderRadius: 'var(--radius-lg)', 
          backgroundColor: bgRgba,
          color: color,
          boxShadow: `0 0 20px ${glowRgba}`
        }}>
          <Icon size={28} />
        </div>
      </div>
      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{description}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalModules: 0,
    activeManagers: 0,
    permissionAssignments: 0
  });
  const [recentManagers, setRecentManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [managersRes, modulesRes] = await Promise.all([
          api.get('/admin/managers'),
          api.get('/admin/modules')
        ]);
        
        const managers = managersRes.data.data;
        const modules = modulesRes.data.data;
        
        const activeManagersCount = managers.length; // Assuming all returned are active or add logic if status exists
        const assignmentsCount = managers.reduce((acc, curr) => acc + (curr.assignedModules?.length || 0), 0);
        
        setStats({
          totalManagers: managers.length,
          totalModules: modules.length,
          activeManagers: activeManagersCount,
          permissionAssignments: assignmentsCount
        });

        // Sort managers by createdAt desc for recent activity (assuming standard ObjectId or createdAt exists)
        const sortedManagers = [...managers].sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }).slice(0, 5);
        
        setRecentManagers(sortedManagers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Overview of your CRM</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/managers" className="btn btn-primary">
            <Plus size={16} /> Add Manager
          </Link>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Total Managers" 
          value={stats.totalManagers} 
          icon={Users} 
          description="Total active managers"
          color="#3b82f6"
          bgRgba="rgba(59, 130, 246, 0.15)"
          glowRgba="rgba(59, 130, 246, 0.3)"
        />
        <StatCard 
          title="Total Modules" 
          value={stats.totalModules} 
          icon={Package} 
          description="Available CRM modules"
          color="#10b981"
          bgRgba="rgba(16, 185, 129, 0.15)"
          glowRgba="rgba(16, 185, 129, 0.3)"
        />
        <StatCard 
          title="Active Managers" 
          value={stats.activeManagers} 
          icon={Activity} 
          description="Managers with active status"
          color="#06b6d4"
          bgRgba="rgba(6, 182, 212, 0.15)"
          glowRgba="rgba(6, 182, 212, 0.3)"
        />
        <StatCard 
          title="Permissions assigned" 
          value={stats.permissionAssignments} 
          icon={ShieldCheck} 
          description="Total module access granted"
          color="#ef4444"
          bgRgba="rgba(239, 68, 68, 0.15)"
          glowRgba="rgba(239, 68, 68, 0.3)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="card-title">Recently Added Managers</h3>
            <Link to="/admin/managers" className="text-primary" style={{ fontSize: 'var(--font-size-sm)', textDecoration: 'none', fontWeight: '500' }}>View All</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentManagers.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center' }} className="text-muted">No managers found</div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentManagers.map(manager => (
                      <tr key={manager._id}>
                        <td className="font-medium">{manager.name}</td>
                        <td className="text-muted">{manager.email}</td>
                        <td>
                          <span className="badge badge-primary">{manager.assignedModules?.length || 0} modules</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Link to="/admin/managers" className="btn btn-secondary" style={{ flexDirection: 'column', height: '120px', gap: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <Users size={32} />
                <span style={{ fontSize: '0.9rem' }}>Manage Users</span>
              </Link>
              <Link to="/admin/modules" className="btn btn-secondary" style={{ flexDirection: 'column', height: '120px', gap: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <Settings size={32} />
                <span style={{ fontSize: '0.9rem' }}>Configure Modules</span>
              </Link>
              <Link to="/admin/permissions" className="btn btn-secondary" style={{ flexDirection: 'column', height: '120px', gap: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <ShieldCheck size={32} />
                <span style={{ fontSize: '0.9rem' }}>Assign Permissions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
