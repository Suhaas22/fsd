import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Search, Send } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../services/api';
import {
  AdminHeader,
  AdminSearch,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { dateLabel } from '../../utils/adminDisplay';
export default function InstructorRequests() {
  const state = useRemoteData('/workspace/organization/teaching-assignments');
  const [search, setSearch] = useState(''),
    [email, setEmail] = useState(''),
    [teacher, setTeacher] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function lookup(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    setTeacher(null);
    try {
      setTeacher(
        await api.get(
          `/workspace/organization/invitation-lookup?${new URLSearchParams({ email })}`
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function invite() {
    setBusy(true);
    setError('');
    try {
      await api.post('/instructor-requests', {
        instructorId: teacher.id,
        message: 'You are invited to join our organization.',
      });
      setMessage(`Invitation sent to ${teacher.name}.`);
      setTeacher(null);
      setEmail('');
      state.refresh();
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const rows =
    state.data?.items.filter((i) =>
      [i.name, i.email, ...i.courses.map((c) => c.title)].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    ) || [];
  return (
    <OrgLayout>
      <div className="admin-page org-invitations-page">
        <AdminHeader title="Teaching Assignments" />
        <section className="admin-card org-invite-panel">
          <div className="admin-section-header">
            <h2>
              <Mail size={17} />
              Invite an Instructor by Email
            </h2>
          </div>
          <form className="org-invite-form" onSubmit={lookup}>
            <input
              className="admin-input"
              type="email"
              aria-label="Instructor email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setTeacher(null);
              }}
              placeholder="Instructor's registered email"
            />
            <button className="admin-button" disabled={busy}>
              <Search size={15} />
              {busy ? 'Checking…' : 'Find instructor'}
            </button>
          </form>
          {teacher && (
            <div className="settings-row">
              <div>
                <h3>{teacher.name}</h3>
                <p>{teacher.email}</p>
              </div>
              <button
                className="admin-button admin-button-primary"
                disabled={busy}
                onClick={invite}
              >
                <Send size={14} />
                Send invitation
              </button>
            </div>
          )}
          {error && (
            <p className="workspace-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="admin-success" role="status">
              {message}
            </p>
          )}
        </section>
        <AdminDataState {...state} />
        {state.data && !state.error && (
          <>
            <div className="admin-toolbar">
              <AdminSearch
                value={search}
                onChange={setSearch}
                placeholder="Search instructors or assigned courses…"
              />
            </div>
            <section className="admin-card org-assignments-panel">
              <div className="admin-section-header">
                <h2>Teaching Assignments</h2>
                <span>{rows.length} instructors</span>
              </div>
              <div className="operations-table-scroll">
                <table className="operations-table">
                  <thead>
                    <tr>
                      <th>Instructor</th>
                      <th>Assigned Course</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <Link
                            className="org-assignment-person"
                            to={`/org/instructors/${i.id}`}
                          >
                            <span className="org-faculty-monogram">
                              {i.name
                                ?.split(' ')
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join('')}
                            </span>
                            <span>
                              <strong>{i.name}</strong>
                              <small>{i.email}</small>
                            </span>
                          </Link>
                          {i.status === 'Suspended' && (
                            <StatusBadge status={i.status} />
                          )}
                        </td>
                        <td>
                          {i.courses.length ? (
                            i.courses.map((c) => (
                              <Link
                                key={c.id}
                                className="org-assignment-course"
                                to={`/org/courses/${c.id}`}
                              >
                                {c.title}
                              </Link>
                            ))
                          ) : (
                            <span className="admin-muted">
                              No courses assigned
                            </span>
                          )}
                        </td>
                        <td>
                          <Link
                            className="admin-button"
                            to={`/org/instructors/${i.id}`}
                          >
                            View instructor
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!rows.length && (
                <AdminEmpty title="No associated instructors match" />
              )}
            </section>
            {state.data.invitations.length > 0 && (
              <section className="admin-card">
                <h2 className="text-sm font-semibold mb-4">
                  Organization invitations
                </h2>
                {state.data.invitations.map((r) => (
                  <div className="settings-row" key={r.id}>
                    <div>
                      <h3>{r.name || r.email}</h3>
                      <p>
                        {r.email} · {dateLabel(r.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </OrgLayout>
  );
}
