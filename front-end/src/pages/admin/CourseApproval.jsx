import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ArrowUpRight,
  Check,
  X,
  Clock3,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminSearch,
  AdminEmpty,
  AdminDataState,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/admin/Pagination';
import { dateLabel } from '../../utils/adminDisplay';
export const CourseApproval = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const state = useRemoteData(
    `/admin/courses?${new URLSearchParams({ search, status: 'Pending Approval', page, limit: 12 })}`
  );
  function open(course, decision) {
    setSelection({ course, decision });
    setReason('');
    setError('');
    setMessage('');
  }
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api.post(
        `/admin/courses/${selection.course.id}/review`,
        {
          decision: selection.decision,
          ...(selection.decision === 'reject' ? { reason } : {}),
        },
        'admin'
      );
      setMessage(
        selection.decision === 'approve'
          ? 'Course approved and published.'
          : 'Course rejected.'
      );
      setSelection(null);
      setPage(1);
      state.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-page">
      <AdminHeader
        eyebrow="Learning management"
        title="Course approvals"
        description="Review the next learning experiences before they go live."
      />
      {message && (
        <p role="status" className="admin-success">
          {message}
        </p>
      )}
      <div className="admin-toolbar">
        <AdminSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search course submissions…"
          label="Search pending courses"
        />
        <span className="admin-count-label">
          <Clock3 size={14} />
          Awaiting review
        </span>
      </div>
      <AdminDataState {...state} />
      {!state.loading && !state.error && (
        <>
          <div className="admin-grid">
            {state.data?.items?.map((c) => (
              <article className="admin-card admin-record" key={c.id}>
                <div className="admin-record-top">
                  <span className="admin-icon-tile admin-icon-amber">
                    <BookOpen size={20} />
                  </span>
                  <Link
                    to={`/admin/courses/${c.id}`}
                    className="admin-button !p-2"
                    aria-label={`View ${c.title}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <p className="admin-record-category">
                  Submitted {dateLabel(c.updatedAt || c.createdAt)}
                </p>
                <h2 className="text-sm font-semibold mt-2 leading-6">
                  {c.title}
                </h2>
                <p className="admin-record-meta">
                  <Building2 size={13} />
                  {c.organizationName || 'Organization not recorded'}
                </p>
                <p className="admin-record-meta">
                  {c.instructors?.map((i) => i.name).join(', ') ||
                    'Instructor not assigned'}
                </p>
                <div className="admin-record-footer mt-5">
                  <button
                    className="admin-button admin-button-primary flex-1"
                    onClick={() => open(c, 'approve')}
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    className="admin-button admin-button-danger flex-1"
                    onClick={() => open(c, 'reject')}
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!state.data?.items?.length && (
            <AdminEmpty
              icon={Check}
              title="You’re all caught up"
              description="New course submissions will appear here when they’re ready for your review."
            />
          )}
          <Pagination
            currentPage={page}
            totalPages={state.data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
      {selection && (
        <div className="admin-modal-backdrop">
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="admin-modal space-y-5"
          >
            <span className="admin-icon-tile admin-icon-green">
              <BookOpen size={22} />
            </span>
            <h2 id="review-title" className="text-xl font-semibold">
              {selection.decision === 'approve' ? 'Approve' : 'Reject'} this
              course?
            </h2>
            <p className="admin-muted">{selection.course.title}</p>
            <p className="admin-muted">
              {selection.decision === 'approve'
                ? 'This course will be published and made available to learners.'
                : 'Include a clear reason for the teaching team.'}
            </p>
            {selection.decision === 'reject' && (
              <label className="block text-sm">
                Reason
                <textarea
                  autoFocus
                  required
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="admin-input mt-2"
                  rows={4}
                />
              </label>
            )}
            {error && (
              <p role="alert" className="admin-alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="admin-button"
                disabled={busy}
                onClick={() => setSelection(null)}
              >
                Cancel
              </button>
              <button
                autoFocus={selection.decision === 'approve'}
                disabled={busy}
                className="admin-button admin-button-primary"
              >
                {busy ? 'Saving…' : 'Confirm decision'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
