import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  AlertTriangle,
  Shield,
  FileText,
  Calendar,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { api } from '../../../utils/api';

const timelineIconMap = {
  created: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
  resolved: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
  rejected: { icon: XCircle, color: 'bg-rose-100 text-rose-600' },
  comment: { icon: MessageSquare, color: 'bg-purple-100 text-purple-600' },
  priority: { icon: Tag, color: 'bg-amber-100 text-amber-600' },
};

const priorityColors = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const typeIcons = {
  'Course Content': FileText,
  Payment: Shield,
  Certificate: CheckCircle,
  'Course Status': AlertTriangle,
  'Instructor Conduct': User,
};

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const DisputeDetailDrawer = ({ dispute, onClose, onUpdated }) => {
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [activeAction, setActiveAction] = useState(null); // 'resolve' | 'reject' | null
  const [loading, setLoading] = useState(false);

  const [actionError, setActionError] = useState(null);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  if (!dispute) return null;

  const TypeIcon = typeIcons[dispute.type] || FileText;
  const isPending = dispute.status === 'Pending';

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    setActionError(null);
    try {
      const updated = await api.post(`/disputes/${dispute.id}/comments`, {
        author: 'Admin',
        message: commentText.trim(),
        isAdmin: true,
      });
      setCommentText('');
      onUpdated(updated);
    } catch (err) {
      console.error('Error adding comment:', err);
      setActionError(err.message || 'Failed to add comment');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveNote.trim()) return;
    setLoading(true);
    setActionError(null);
    try {
      const updated = await api.post(`/disputes/${dispute.id}/resolve`, {
        resolutionNote: resolveNote.trim(),
        resolvedBy: 'Admin User',
      });
      setActiveAction(null);
      setResolveNote('');
      onUpdated(updated);
    } catch (err) {
      console.error('Error resolving dispute:', err);
      setActionError(err.message || 'Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    setActionError(null);
    try {
      const updated = await api.post(`/disputes/${dispute.id}/reject`, {
        rejectionReason: rejectReason.trim(),
        resolvedBy: 'Admin User',
      });
      setActiveAction(null);
      setRejectReason('');
      onUpdated(updated);
    } catch (err) {
      console.error('Error rejecting dispute:', err);
      setActionError(err.message || 'Failed to reject dispute');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === dispute.priority || updatingPriority) return;
    setUpdatingPriority(true);
    setActionError(null);
    try {
      const updated = await api.patch(`/disputes/${dispute.id}/priority`, {
        priority: newPriority,
      });
      onUpdated(updated);
    } catch (err) {
      console.error('Error updating priority:', err);
      setActionError(err.message || 'Failed to update priority');
    } finally {
      setUpdatingPriority(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {dispute.id}
                </span>
                <StatusBadge status={dispute.status} />
                <div className="relative inline-flex items-center">
                  <select
                    value={dispute.priority || 'Medium'}
                    disabled={updatingPriority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className={`text-xs font-semibold rounded-full border px-2.5 py-0.5 appearance-none pr-5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-300 ${priorityColors[dispute.priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    title="Click to change priority"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <ChevronRight className="w-3 h-3 rotate-90 absolute right-1.5 pointer-events-none opacity-60" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-slate-800 leading-snug max-w-md">
                {dispute.subject}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {actionError && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {actionError}
              </span>
              <button
                onClick={() => setActionError(null)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-3 p-6 pb-4">
            {[
              {
                label: 'Raised By',
                value: (
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${dispute.raisedByType === 'Organization' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {dispute.raisedByType === 'Organization' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{dispute.raisedBy}</span>
                    <span className="text-xs text-slate-400">({dispute.raisedByType})</span>
                  </div>
                ),
              },
              { label: 'Type', value: <span className="font-semibold text-slate-800 text-sm">{dispute.type}</span> },
              { label: 'Course', value: <span className="font-semibold text-slate-800 text-sm">{dispute.course}</span> },
              { label: 'Organization', value: <span className="font-semibold text-slate-800 text-sm">{dispute.organization}</span> },
              {
                label: 'Opened On',
                value: (
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateTime(dispute.createdAt || dispute.date)}
                  </span>
                ),
              },
              dispute.resolvedAt
                ? {
                    label: dispute.status === 'Rejected' ? 'Rejected On' : 'Resolved On',
                    value: (
                      <span className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateTime(dispute.resolvedAt)}
                      </span>
                    ),
                  }
                : { label: 'Resolved On', value: <span className="text-slate-400 text-sm">—</span> },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-400 font-medium mb-1">{item.label}</div>
                {item.value}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="px-6 pb-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-700 text-sm leading-relaxed">{dispute.description}</p>
            </div>
          </div>

          {/* Resolution / Rejection Note */}
          {dispute.resolutionNote && (
            <div className="px-6 pb-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Resolution Note
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">{dispute.resolutionNote}</p>
                {dispute.resolvedBy && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">— Resolved by {dispute.resolvedBy}</p>
                )}
              </div>
            </div>
          )}

          {dispute.rejectionReason && (
            <div className="px-6 pb-4">
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                <h3 className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Rejection Reason
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">{dispute.rejectionReason}</p>
                {dispute.resolvedBy && (
                  <p className="text-xs text-rose-600 mt-2 font-medium">— Rejected by {dispute.resolvedBy}</p>
                )}
              </div>
            </div>
          )}

          {/* Inline Resolve/Reject Panel */}
          {isPending && (
            <div className="px-6 pb-4">
              {activeAction === null && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveAction('resolve')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve Dispute
                  </button>
                  <button
                    onClick={() => setActiveAction('reject')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject Dispute
                  </button>
                </div>
              )}

              {activeAction === 'resolve' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Resolve Dispute
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Resolution Note <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={resolveNote}
                      onChange={(e) => setResolveNote(e.target.value)}
                      className="w-full border border-emerald-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none h-20"
                      placeholder="Describe how this dispute was resolved..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResolve}
                      disabled={!resolveNote.trim() || loading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Resolving...' : 'Confirm Resolution'}
                    </button>
                    <button
                      onClick={() => setActiveAction(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {activeAction === 'reject' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-rose-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject Dispute
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rejection Reason <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full border border-rose-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none h-20"
                      placeholder="Explain why this dispute is being rejected..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim() || loading}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                    <button
                      onClick={() => setActiveAction(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Thread */}
          <div className="px-6 pb-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Comments & Notes
                </h3>
                <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5 font-semibold">
                  {(dispute.comments || []).length}
                </span>
              </div>

              {/* Comment list */}
              <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
                {(dispute.comments || []).length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No comments yet. Be the first to add a note.</p>
                ) : (
                  (dispute.comments || []).map((c, i) => (
                    <div key={c.id || i} className={`flex gap-3 ${c.isAdmin === false ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c.isAdmin !== false ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {(c.author || c.user || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className={`flex-1 rounded-xl px-3 py-2 text-sm ${c.isAdmin !== false ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 text-xs">{c.author || c.user}</span>
                          {c.isAdmin !== false && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">Admin</span>
                          )}
                          <span className="text-slate-400 text-xs ml-auto">{formatDateTime(c.timestamp)}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{c.message || c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment input */}
              <div className="border-t border-slate-200 p-3 flex items-end gap-2 bg-white">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  A
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none h-10"
                  placeholder="Add an internal note... (Enter to send)"
                  rows={1}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || sending}
                  className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {(dispute.timeline || []).length > 0 && (
            <div className="px-6 pb-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Activity Timeline
                  </h3>
                </div>
                <div className="p-4">
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
                    <div className="space-y-4">
                      {[...(dispute.timeline || [])].reverse().map((item, i) => {
                        const config = timelineIconMap[item.type] || timelineIconMap.created;
                        const Icon = config.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 pl-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color} z-10 relative`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="text-sm font-medium text-slate-800">{item.event}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                {item.actor && (
                                  <>
                                    <User className="w-3 h-3" />
                                    <span>{item.actor}</span>
                                    <span>·</span>
                                  </>
                                )}
                                <span>{formatDateTime(item.date || item.timestamp)}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
