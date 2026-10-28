import { BookOpen, Users, Mail, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../services/api';
import {
  AdminHeader,
  AdminDataState,
  AdminEmpty,
  AdminMetric,
} from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
export default function InstructorDetails() {
  const { id } = useParams(),
    state = useRemoteData(`/workspace/organization/instructors/${id}`),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const i = state.data;
  async function toggle() {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/instructors/${id}`, {
        status: i.status === 'Suspended' ? 'Active' : 'Suspended',
      });
      state.refresh();
      window.dispatchEvent(new Event('learning-data-changed'));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <OrgLayout>
      <div className="admin-page">
        <Link
          to="/org/instructors"
          className="admin-count-label"
        >
          Back to instructors
        </Link>
        <AdminDataState {...state} />
        {i && !state.error && (
          <>
            <AdminHeader title={i.name}>
              <StatusBadge status={i.status} />
              {i.status === 'Active' ? (
                <Link
                  className="admin-button"
                  to={`/org/courses/assign?instructorId=${id}`}
                >
                  Assign course
                </Link>
              ) : (
                <button
                  className="admin-button"
                  disabled
                >
                  Assignment disabled
                </button>
              )}
              <button
                className="admin-button"
                disabled={busy}
                onClick={toggle}
              >
                {busy
                  ? 'Saving…'
                  : i.status === 'Suspended'
                    ? 'Make active'
                    : 'Suspend instructor'}
              </button>
            </AdminHeader>
            {error && (
              <p
                role="alert"
                className="workspace-error"
              >
                {error}
              </p>
            )}
            <section className="admin-card org-instructor-hero">
              <div className="org-instructor-identity">
                <span className="org-instructor-monogram">
                  {i.name
                    ?.split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{i.name}</h2>
                  <p>{i.specialization || 'Instructor'}</p>
                  <p>{i.organizationName}</p>
                </div>
              </div>
              <a
                className="admin-button"
                href={`mailto:${i.email}`}
              >
                <Mail size={15} />
                {i.email}
              </a>
            </section>
            <div className="admin-stats-grid org-summary">
              <AdminMetric
                icon={BookOpen}
                label="Assigned courses"
                value={i.courses.length}
              />
              <AdminMetric
                icon={Users}
                label="Total enrollments"
                value={i.totalEnrollments}
              />
            </div>
            <section className="admin-card">
              <div className="admin-section-header">
                <h2>Assigned courses</h2>
                <span>{i.totalEnrollments} total enrollments</span>
              </div>
              <div className="admin-grid">
                {i.courses.map((c) => (
                  <Link
                    key={c.id}
                    className="finance-summary-card"
                    to={`/org/courses/${c.id}`}
                  >
                    <h3>{c.title}</h3>
                    <p className="admin-muted mt-3 mb-3">
                      {c.enrollments} enrollments
                    </p>
                    <StatusBadge status={c.status} />
                    <span className="flex items-center gap-2 mt-5 text-sm">
                      View course
                      <ArrowUpRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
              {!i.courses.length && <AdminEmpty title="No courses assigned" />}
            </section>
          </>
        )}
      </div>
    </OrgLayout>
  );
}
