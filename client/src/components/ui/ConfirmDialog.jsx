import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <div className="flex gap-4 mb-6">
        {isDestructive && (
          <div className="text-danger" style={{ flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
        )}
        <p className="text-main" style={{ marginTop: '2px' }}>{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button 
          className="btn btn-secondary" 
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button 
          className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`} 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
