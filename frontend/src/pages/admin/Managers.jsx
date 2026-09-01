import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form states
  const [currentManager, setCurrentManager] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Delete states
  const [managerToDelete, setManagerToDelete] = useState(null);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/managers');
      setManagers(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch managers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentManager({ name: '', email: '', password: '' });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (manager) => {
    setIsEditing(true);
    // password left blank so it only updates if provided
    setCurrentManager({ _id: manager._id, name: manager.name, email: manager.email, password: '' });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (manager) => {
    setManagerToDelete(manager);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!currentManager.name || !currentManager.email) {
      setFormError('Name and email are required');
      return;
    }
    if (!isEditing && (!currentManager.password || currentManager.password.length < 6)) {
      setFormError('Password of at least 6 characters is required for new managers');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        name: currentManager.name, 
        email: currentManager.email 
      };
      if (currentManager.password) {
        payload.password = currentManager.password;
      }

      if (isEditing) {
        await api.put(`/admin/managers/${currentManager._id}`, payload);
      } else {
        await api.post('/admin/managers', payload);
      }
      setIsFormModalOpen(false);
      fetchManagers();
    } catch (err) {
      setFormError(err.response?.data?.error || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!managerToDelete) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/managers/${managerToDelete._id}`);
      setIsDeleteModalOpen(false);
      setManagerToDelete(null);
      fetchManagers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Managers</h1>
          <p className="page-description">Manage access and accounts for CRM Managers</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add Manager
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body flex justify-center py-8">
            <span className="text-muted">Loading managers...</span>
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="text-danger">{error}</div>
            <button className="btn btn-secondary mt-4" onClick={fetchManagers}>Retry</button>
          </div>
        ) : managers.length === 0 ? (
          <div className="card-body text-center py-8">
            <User size={48} className="text-muted mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg">No managers found</h3>
            <p className="text-muted mt-1">Add a manager to give them access to the CRM.</p>
            <button className="btn btn-primary mt-4" onClick={handleOpenCreate}>
              <Plus size={16} /> Add Manager
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Module Access</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((manager) => (
                  <tr key={manager._id}>
                    <td className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.875rem', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-main)' }}>
                          {manager.name.charAt(0).toUpperCase()}
                        </div>
                        {manager.name}
                      </div>
                    </td>
                    <td className="text-muted">{manager.email}</td>
                    <td><span className="badge badge-secondary">{manager.role}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary">{manager.assignedModules?.length || 0} assigned</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link to="/admin/permissions" state={{ managerId: manager._id }} className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Manage Permissions">
                          <ShieldCheck size={16} />
                        </Link>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleOpenEdit(manager)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-danger)' }} onClick={() => handleOpenDelete(manager)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Manager' : 'Add Manager'}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
              {formError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input 
              id="name" 
              className="form-input" 
              value={currentManager.name} 
              onChange={(e) => setCurrentManager({...currentManager, name: e.target.value})}
              disabled={isSubmitting}
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input 
              id="email" 
              type="email"
              className="form-input" 
              value={currentManager.email} 
              onChange={(e) => setCurrentManager({...currentManager, email: e.target.value})}
              disabled={isSubmitting}
              placeholder="jane@example.com"
            />
          </div>
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="password">
              Password {isEditing ? '(Leave blank to keep current)' : '*'}
            </label>
            <input 
              id="password" 
              type="password"
              className="form-input" 
              value={currentManager.password} 
              onChange={(e) => setCurrentManager({...currentManager, password: e.target.value})}
              disabled={isSubmitting}
              placeholder={isEditing ? "••••••••" : "At least 6 characters"}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Manager'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Manager"
        message={`Are you sure you want to delete the manager "${managerToDelete?.name}"? They will lose all access to the CRM immediately. This action cannot be undone.`}
        confirmText="Delete Manager"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Managers;
