import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const ModalBase = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "danger" }) => {
  const confirmClasses = {
    danger: "bg-rose-500 hover:bg-rose-600 text-white",
    primary: "bg-primary hover:bg-primary-dark text-white",
  };

  return (
    <ModalBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={clsx("px-4 py-2 font-medium rounded-lg transition-colors", confirmClasses[variant] || confirmClasses.primary)}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-slate-600">{message}</p>
    </ModalBase>
  );
};

export const ApprovalModal = ({ isOpen, onClose, onApprove, title, itemName }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onApprove}
      title={title}
      message={`Are you sure you want to approve ${itemName}? This action will make it visible to the public.`}
      confirmText="Approve"
      variant="primary"
    />
  );
};

export const RejectModal = ({ isOpen, onClose, onReject, title, itemName }) => {
  const [reason, setReason] = React.useState('');

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(reason);
    onClose();
    setReason('');
  };

  return (
    <ModalBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleReject}
            disabled={!reason.trim()}
            className="px-4 py-2 font-medium rounded-lg transition-colors bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-slate-600">Please provide a reason for rejecting {itemName}. This will be sent to the user.</p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason <span className="text-rose-500">*</span></label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24 text-sm"
            placeholder="Explain why this was rejected..."
          ></textarea>
        </div>
      </div>
    </ModalBase>
  );
};
