import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../utils/api';
import { AdminHeader, AdminDataState, AdminEmpty } from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
import { dateLabel } from '../../utils/adminDisplay';
export default function ModuleRequests({ courseId, embedded = false }) {
  const [params] = useSearchParams();
  const requested = params.get('requestId');
  const state = useRemoteData(
    '/courses/module-requests/mine' +
      (courseId ? '?' + new URLSearchParams({ courseId }) : ''),
  );
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (requested && state.data)
      document
        .getElementById(`request-${requested}`)
        ?.scrollIntoView({ block: 'start' });
  }, [requested, state.data]);
  async function decide(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/courses/module-requests/${decision.id}/decision`, {
        decision: decision.value,
        note,
      });
      setDecision(null);
      setNote('');
      state.refresh();
      window.dispatchEvent(new Event('learning-data-changed'));
      window.dispatchEvent(new Event('notifications-changed'));
      setMessage('Decision saved. The instructor has been notified.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-page">
      <AdminHeader
        title={embedded ? 'Curriculum requests' : 'Content changes'}
      />
      {message && (
        <p
          className="admin-success"
          role="status"
        >
          {message}
        </p>
      )}
      <AdminDataState {...state} />
      {!state.loading && !state.error && (
        <>
          {state.data?.map((r) => (
            <section
              id={`request-${r.id}`}
              className={`admin-card operations-request ${requested === r.id ? 'is-highlighted' : ''}`}
              key={r.id}
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{r.courseTitle}</h2>
                  <p className="admin-muted mt-2">
                    Submitted by {r.instructorName} · {dateLabel(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <h3 className="font-semibold text-sm mt-6">
                Proposed curriculum · {r.modules.length} modules
              </h3>
              <div className="grid gap-3 mt-4">
                {r.modules.map((m, i) => (
                  <article
                    className="directory-detail-item"
                    key={m.id || i}
                  >
                    <strong>
                      {i + 1}. {m.title}
                    </strong>
                    <div className="grid gap-2">
                      {(Array.isArray(m.items)
                        ? m.items
                        : Array.isArray(m.lessons)
                          ? m.lessons
                          : []
                      ).map((item, n) => (
                        <p key={item.id || n}>
                          {n + 1}.{' '}
                          {item.title || item.name || 'Untitled lesson'}
                          {item.type ? ` · ${item.type}` : ''}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              {r.note && (
                <p className="admin-muted mt-4">Review note: {r.note}</p>
              )}
              {r.status === 'Pending' &&
                (decision?.id === r.id ? (
                  <form
                    className="account-confirm rounded-xl p-5 mt-5"
                    onSubmit={decide}
                  >
                    <h3 className="font-semibold text-sm">
                      {decision.value === 'approve'
                        ? 'Approve these curriculum changes?'
                        : 'Reject these curriculum changes?'}
                    </h3>
                    <p className="admin-muted mt-3">
                      {decision.value === 'approve'
                        ? 'For published courses, approved changes become visible to enrolled learners. Draft courses still need platform approval before publication.'
                        : 'The existing course curriculum will stay as it is.'}
                    </p>
                    <label className="block text-xs mt-4">
                      Review note
                      {decision.value === 'reject' ? ' (required)' : ''}
                      <textarea
                        className="admin-input mt-2"
                        rows={3}
                        value={note}
                        required={decision.value === 'reject'}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </label>
                    {error && (
                      <p
                        className="workspace-error mt-3"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button
                        className="admin-button"
                        type="button"
                        disabled={busy}
                        onClick={() => setDecision(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="admin-button admin-button-primary"
                        disabled={busy}
                      >
                        {busy ? 'Saving…' : 'Confirm decision'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-3 mt-5">
                    <button
                      disabled={r.instructorStatus !== 'Active'}
                      title={
                        r.instructorStatus !== 'Active'
                          ? 'Instructor is suspended or unavailable'
                          : undefined
                      }
                      className="admin-button admin-button-primary"
                      onClick={() => {
                        setDecision({ id: r.id, value: 'approve' });
                        setNote('');
                        setError('');
                      }}
                    >
                      Approve changes
                    </button>
                    <button
                      className="admin-button"
                      onClick={() => {
                        setDecision({ id: r.id, value: 'reject' });
                        setNote('');
                        setError('');
                      }}
                    >
                      Reject with note
                    </button>
                  </div>
                ))}
            </section>
          ))}
          {!state.data?.length && (
            <AdminEmpty
              title="No curriculum requests"
              description="Module changes submitted by your instructors will appear here for review."
            />
          )}
        </>
      )}
    </div>
  );
}
