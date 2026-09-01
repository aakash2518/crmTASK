import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Save, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const Permissions = () => {
  const location = useLocation();
  const initialManagerId = location.state?.managerId || '';

  const [managers, setManagers] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(initialManagerId);
  const [selectedModules, setSelectedModules] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // To track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [managersRes, modulesRes] = await Promise.all([
          api.get('/admin/managers'),
          api.get('/admin/modules')
        ]);
        setManagers(managersRes.data.data);
        setModules(modulesRes.data.data.filter(m => m.isActive)); // only assignable if active
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedManagerId && managers.length > 0) {
      const manager = managers.find(m => m._id === selectedManagerId);
      if (manager) {
        // Extract assigned module IDs
        const assignedIds = (manager.assignedModules || []).map(m => typeof m === 'object' ? m._id : m);
        setSelectedModules(assignedIds);
        setHasUnsavedChanges(false);
      }
    } else {
      setSelectedModules([]);
      setHasUnsavedChanges(false);
    }
  }, [selectedManagerId, managers]);

  const handleToggleModule = (moduleId) => {
    setSelectedModules(prev => {
      const newSelection = prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId];
      return newSelection;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!selectedManagerId) return;
    
    setSaving(true);
    setError(null);
    try {
      await api.put(`/admin/managers/${selectedManagerId}/permissions`, {
        moduleIds: selectedModules
      });
      
      // Update local state to reflect changes without a full refetch
      setManagers(prev => prev.map(m => {
        if (m._id === selectedManagerId) {
          // Rebuild assigned modules (simplified for UI, just keeping counts right)
          // In a real app we might want to populate fully or just refetch
          return { ...m, assignedModules: selectedModules };
        }
        return m;
      }));
      
      setHasUnsavedChanges(false);
      
      // Show toast
      setToastMessage('Permissions saved successfully');
      setTimeout(() => setToastMessage(''), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (error && !managers.length) {
    return <div className="text-danger p-4 card">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Permissions Assignment</h1>
          <p className="page-description">Manage module access for Managers</p>
        </div>
      </div>

      <div className="card max-w-4xl">
        <div className="card-header bg-secondary flex items-center gap-4 py-6 border-b border-border">
          <div className="form-group mb-0 w-full max-w-md">
            <label className="form-label" htmlFor="manager-select">Select Manager</label>
            <select
              id="manager-select"
              className="form-input"
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
            >
              <option value="">-- Choose a manager --</option>
              {managers.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedManagerId ? (
          <div className="card-body">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-danger rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <h3 className="text-lg font-semibold mb-4">Module Access</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {modules.map(module => {
                const isSelected = selectedModules.includes(module._id);
                return (
                  <div 
                    key={module._id}
                    onClick={() => handleToggleModule(module._id)}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      backgroundColor: isSelected ? 'rgba(59,130,246,0.05)' : 'var(--color-bg-card)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px',
                      borderRadius: '4px',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <CheckCircle size={16} color="white" />}
                    </div>
                    <div>
                      <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {module.icon && <span>{module.icon}</span>}
                        {module.name}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {modules.length === 0 && (
                <div className="text-muted py-4 col-span-full">
                  No active modules available. Go to Modules to create some.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm">
                {hasUnsavedChanges ? (
                  <span className="text-warning flex items-center gap-1">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-warning)', display: 'inline-block' }}></span>
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-muted">All changes saved</span>
                )}
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card-body text-center py-12">
            <ShieldCheck size={48} className="text-muted mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-muted">No Manager Selected</h3>
            <p className="text-muted mt-1 text-sm">Please select a manager from the dropdown above to view and assign module permissions.</p>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="toast-container">
          <div className="toast" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <CheckCircle color="var(--color-success)" size={20} />
            <div>
              <strong className="block text-sm">Success</strong>
              <span className="text-sm text-muted">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
