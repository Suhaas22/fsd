import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ModalBase = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          'bg-white rounded-2xl shadow-xl w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100',
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  variant = 'danger',
}) => {
  const confirmClasses = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    primary: 'bg-[#0056D2] hover:bg-[#00419E] text-white',
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
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-xs',
              confirmClasses[variant] || confirmClasses.primary
            )}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
    </ModalBase>
  );
};

export const ApprovalModal = ({
  isOpen,
  onClose,
  onApprove,
  title,
  itemName,
}) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onApprove}
      title={title}
      message={`Are you sure you want to approve ${itemName}? This action will make it visible to the platform.`}
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
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            Reject
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Please provide a reason for rejecting {itemName}. This will be
          communicated to the user.
        </p>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Rejection Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] resize-none h-24 placeholder:text-slate-400"
            placeholder="Explain reason for rejection..."
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default ModalBase;
