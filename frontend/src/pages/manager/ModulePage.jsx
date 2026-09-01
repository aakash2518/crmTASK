import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ArrowLeft, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Dynamic field configuration based on module slug
const MODULE_CONFIG = {
  sales: [
    { name: 'customer', label: 'Customer Name', type: 'text' },
    { name: 'product', label: 'Product/Service', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'agent', label: 'Sales Agent', type: 'text' },
    { name: 'status', label: 'Deal Status', type: 'select', options: ['Lead', 'In Progress', 'Won', 'Lost'] },
    { name: 'date', label: 'Date', type: 'date' }
  ],
  operations: [
    { name: 'task', label: 'Task Name', type: 'text' },
    { name: 'assignee', label: 'Responsible Person', type: 'text' },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { name: 'status', label: 'Task Status', type: 'select', options: ['Pending', 'Active', 'In Progress', 'Inactive'] },
    { name: 'dueDate', label: 'Due Date', type: 'date' }
  ],
  customers: [
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending', 'Inactive'] }
  ],
  employees: [
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
  ],
  finance: [
    { name: 'transaction', label: 'Transaction Details', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'type', label: 'Type', type: 'select', options: ['Income', 'Expense'] },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending'] },
    { name: 'date', label: 'Date', type: 'date' }
  ],
  support: [
    { name: 'customer', label: 'Customer', type: 'text' },
    { name: 'issue', label: 'Issue Description', type: 'text' },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending', 'In Progress', 'Closed'] },
    { name: 'agent', label: 'Assigned Agent', type: 'text' }
  ]
};

const formatValue = (value, type) => {
  if (value === undefined || value === null || value === '') return '—';
  if (type === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  if (type === 'date') {
    return new Date(value).toLocaleDateString();
  }
  return value;
};

const getBadgeClass = (value) => {
  const val = String(value).toLowerCase();
  if (['active', 'won', 'income', 'low'].includes(val)) return 'badge-success';
  if (['pending', 'in progress', 'medium', 'lead'].includes(val)) return 'badge-warning';
  if (['inactive', 'lost', 'expense', 'high', 'urgent', 'closed'].includes(val)) return 'badge-secondary';
  return 'badge-secondary';
};

const ModulePage = () => {
  const { slug } = useParams();
  
  const [moduleInfo, setModuleInfo] = useState(null);
  const [data, setData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Current Record State
  const [currentRecord, setCurrentRecord] = useState({ title: '', description: '', status: 'active', data: {} });
  const [recordToDelete, setRecordToDelete] = useState(null);

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch user's assigned modules to get the module details first
      const modulesRes = await api.get('/modules');
      const mod = modulesRes.data.data.find(m => m.slug === slug);
      
      if (!mod) {
        // Fallback or 403 will be triggered below if unauthorized
        setModuleInfo({ name: slug, slug });
      } else {
        setModuleInfo(mod);
      }

      // Fetch the actual data
      const dataRes = await api.get(`/modules/${slug}/data`);
      setData(dataRes.data.data);
      
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('FORBIDDEN');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch module data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleData();
  }, [slug]);

  const config = MODULE_CONFIG[slug] || [];

  const handleOpenCreate = () => {
    setCurrentRecord({ title: '', description: '', status: 'active', data: {} });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setCurrentRecord({ 
      _id: record._id, 
      title: record.title, 
      description: record.description || '', 
      status: record.status, 
      data: record.data || {} 
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleFieldChange = (fieldName, value) => {
    setCurrentRecord(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldName]: value
      }
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!currentRecord.title.trim()) {
      setFormError('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentRecord._id) {
        await api.put(`/modules/${slug}/data/${currentRecord._id}`, currentRecord);
      } else {
        await api.post(`/modules/${slug}/data`, currentRecord);
      }
      setIsFormModalOpen(false);
      fetchModuleData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save record. Please check validation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/modules/${slug}/data/${recordToDelete._id}`);
      setIsDeleteModalOpen(false);
      fetchModuleData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render 403 state
  if (error === 'FORBIDDEN') {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="text-danger page-title" style={{ fontSize: '2rem' }}>403 Forbidden</h1>
        <p className="text-muted">You don't have permission to access this module.</p>
        <Link to="/manager/dashboard" className="btn btn-primary mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading module data...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-danger">{error}</p>
          <button className="btn btn-secondary mt-4" onClick={fetchModuleData}>Retry</button>
        </div>
      </div>
    );
  }

  let filteredData = data.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  filteredData.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (sortField.startsWith('data.')) {
      const dataField = sortField.split('.')[1];
      valA = a.data ? a.data[dataField] : '';
      valB = b.data ? b.data[dataField] : '';
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="mb-4">
        <Link to="/manager/dashboard" className="text-muted flex items-center gap-1" style={{ fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
      
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="flex items-center gap-3">
            {moduleInfo?.icon && <span style={{ fontSize: '1.75rem' }}>{moduleInfo.icon}</span>}
            <h1 className="page-title m-0">{moduleInfo?.name || slug}</h1>
          </div>
          <p className="page-description">{moduleInfo?.description || `Manage records for ${slug}`}</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="search-bar" style={{ width: '100%', maxWidth: '300px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="search-input w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <span className="text-muted text-sm">{filteredData.length} records</span>
        </div>
        
        {filteredData.length === 0 ? (
          <div className="card-body text-center py-12">
            {config.length === 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Welcome to {moduleInfo?.name || slug}</h2>
                <p className="text-muted">{moduleInfo?.description || 'Get started by creating your first record.'}</p>
              </div>
            )}
            {config.length > 0 && (
              <h3 className="font-semibold text-lg text-muted">No records found</h3>
            )}
            <p className="text-muted mt-1 text-sm">Create the first record in this module to get started.</p>
            <button className="btn btn-secondary mt-4" onClick={handleOpenCreate}>
              <Plus size={16} /> Add Record
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                    <div className="flex items-center gap-1">Title <ArrowUpDown size={14} className="text-muted" /></div>
                  </th>
                  {config.slice(0, 3).map(field => (
                    <th key={field.name} onClick={() => handleSort(`data.${field.name}`)} style={{ cursor: 'pointer' }}>
                      <div className="flex items-center gap-1">{field.label} <ArrowUpDown size={14} className="text-muted" /></div>
                    </th>
                  ))}
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    <div className="flex items-center gap-1">Global Status <ArrowUpDown size={14} className="text-muted" /></div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(row => (
                  <tr key={row._id}>
                    <td className="font-medium">
                      {row.title}
                      {row.description && <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal', marginTop: '0.25rem' }}>{row.description}</div>}
                    </td>
                    {config.slice(0, 3).map(field => {
                      const value = row.data ? row.data[field.name] : null;
                      return (
                        <td key={field.name} className="text-muted">
                          {field.name === 'status' || field.name === 'priority' ? (
                             <span className={`badge ${getBadgeClass(value)}`}>{value || '—'}</span>
                          ) : (
                             formatValue(value, field.type)
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <span className={`badge ${row.status === 'active' ? 'badge-success' : row.status === 'pending' ? 'badge-warning' : 'badge-secondary'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => handleOpenEdit(row)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-danger)' }} onClick={() => handleOpenDelete(row)} title="Delete">
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
        title={currentRecord._id ? 'Edit Record' : 'Add Record'}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
              {formError}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title *</label>
            <input 
              id="title" 
              className="form-input" 
              value={currentRecord.title} 
              onChange={(e) => setCurrentRecord({...currentRecord, title: e.target.value})}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea 
              id="description" 
              className="form-input" 
              value={currentRecord.description} 
              onChange={(e) => setCurrentRecord({...currentRecord, description: e.target.value})}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Global Status</label>
            <select 
              id="status" 
              className="form-input" 
              value={currentRecord.status} 
              onChange={(e) => setCurrentRecord({...currentRecord, status: e.target.value})}
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Render dynamic config fields based on slug */}
          {config.length > 0 && (
            <div className="mt-6 mb-2">
              <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide border-b border-border pb-2">Module Specific Data</h4>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            {config.map(field => (
              <div key={field.name} className="form-group" style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
                <label className="form-label" htmlFor={`dyn_${field.name}`}>{field.label} {field.name === 'amount' || field.name === 'customer' || field.name === 'email' ? '*' : ''}</label>
                {field.type === 'select' ? (
                  <select 
                    id={`dyn_${field.name}`}
                    className="form-input"
                    value={currentRecord.data[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select --</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input 
                    id={`dyn_${field.name}`}
                    type={field.type}
                    className="form-input"
                    value={currentRecord.data[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={isSubmitting}
                    step={field.type === 'number' ? '0.01' : undefined}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Record"
        message={`Are you sure you want to delete "${recordToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Record"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ModulePage;
