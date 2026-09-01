import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form states
  const [currentModule, setCurrentModule] = useState({ name: '', description: '', icon: '', isActive: true });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete states
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/modules');
      setModules(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch modules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenCreate = () => {
    setCurrentModule({ name: '', description: '', icon: '', isActive: true });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (module) => {
    setCurrentModule({ ...module });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (module) => {
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!currentModule.name.trim()) {
      setFormError('Module name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentModule._id) {
        // Edit
        await api.put(`/admin/modules/${currentModule._id}`, currentModule);
      } else {
        // Create
        const slug = currentModule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        await api.post('/admin/modules', { ...currentModule, slug });
      }
      setIsFormModalOpen(false);
      fetchModules();
    } catch (err) {
      setFormError(err.response?.data?.error || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!moduleToDelete) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/modules/${moduleToDelete._id}`);
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      fetchModules();
    } catch (err) {
      // Could show toast here
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Modules</h1>
          <p className="page-description">Manage dynamic CRM modules</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create Module
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body flex justify-center py-8">
            <span className="text-muted">Loading modules...</span>
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="text-danger">{error}</div>
            <button className="btn btn-secondary mt-4" onClick={fetchModules}>Retry</button>
          </div>
        ) : modules.length === 0 ? (
          <div className="card-body text-center py-8">
            <Package size={48} className="text-muted mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg">No modules found</h3>
            <p className="text-muted mt-1">Get started by creating a new module.</p>
            <button className="btn btn-primary mt-4" onClick={handleOpenCreate}>
              <Plus size={16} /> Create Module
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module._id}>
                    <td className="font-medium">
                      <div className="flex items-center gap-2">
                        {module.icon && <span className="text-muted" style={{ fontSize: '1.25rem' }}>{module.icon}</span>}
                        {module.name}
                      </div>
                    </td>
                    <td className="text-muted">{module.description || '—'}</td>
                    <td><code style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-secondary)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{module.slug}</code></td>
                    <td>
                      {module.isActive ? (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-secondary flex items-center gap-1 w-fit">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleOpenEdit(module)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-danger)' }} onClick={() => handleOpenDelete(module)} title="Delete">
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
        title={currentModule._id ? 'Edit Module' : 'Create Module'}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
              {formError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Module Name *</label>
            <input 
              id="name" 
              className="form-input" 
              value={currentModule.name} 
              onChange={(e) => setCurrentModule({...currentModule, name: e.target.value})}
              disabled={isSubmitting}
              placeholder="e.g., Marketing"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <input 
              id="description" 
              className="form-input" 
              value={currentModule.description} 
              onChange={(e) => setCurrentModule({...currentModule, description: e.target.value})}
              disabled={isSubmitting}
              placeholder="Brief description"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="icon">Icon (Emoji)</label>
            <input 
              id="icon" 
              className="form-input" 
              value={currentModule.icon} 
              onChange={(e) => setCurrentModule({...currentModule, icon: e.target.value})}
              disabled={isSubmitting}
              placeholder="e.g., 📢"
            />
          </div>
          <div className="form-group mb-6">
            <label className="form-label flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={currentModule.isActive}
                onChange={(e) => setCurrentModule({...currentModule, isActive: e.target.checked})}
                disabled={isSubmitting}
              />
              Active (Available for assignment)
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Module'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Module"
        message={`Are you sure you want to delete the "${moduleToDelete?.name}" module? This will also delete all associated module data. This action cannot be undone.`}
        confirmText="Delete Module"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Modules;
