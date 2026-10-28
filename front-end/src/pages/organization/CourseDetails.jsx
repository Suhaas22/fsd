import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  CreditCard,
  Send,
  Edit,
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../services/api';
import {
  AdminHeader,
  AdminMetric,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { money } from '../../utils/adminDisplay';
import ModuleRequests from '../../components/workspace/ModuleRequests';
export default function CourseDetails() {
  const { id } = useParams();
  const state = useRemoteData(`/courses/${id}/organization`);
  const course = state.data;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await api.post(`/courses/${id}/submit`, {});
      state.refresh();
      window.dispatchEvent(new Event('learning-data-changed'));
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <OrgLayout>
      <div className="admin-page">
        <Link className="admin-count-label" to="/org/courses">
          <ArrowLeft size={14} />
          Courses
        </Link>
        <AdminDataState {...state} />
        {course && !state.error && (
          <>
            <AdminHeader title={course.title}>
              <Link
                className="admin-button"
                to="/org/dashboard?payments=received#organization-payments"
              >
                Received payments
              </Link>
              <StatusBadge status={course.status} />
              <Link className="admin-button" to={`/org/courses/${id}/edit`}>
                <Edit size={14} />
                Edit course
              </Link>
            </AdminHeader>
            {error && (
              <p role="alert" className="workspace-error">
                {error}
              </p>
            )}
            {['Draft'].includes(course.status) && (
              <section className="admin-card course-submission-card">
                <div>
                  <h2>Platform approval</h2>
                  <p>
                    Submit this course to an administrator. It appears in the
                    learner catalog after approval.
                  </p>
                </div>
                <button
                  className="admin-button admin-button-primary"
                  disabled={busy}
                  onClick={submit}
                >
                  <Send size={14} />
                  {busy ? 'Submitting…' : 'Submit for admin approval'}
                </button>
              </section>
            )}
            {course.status === 'Pending Approval' && (
              <p className="learner-record-note">
                Awaiting administrator approval. This course is not yet
                available in the learner catalog.
              </p>
            )}
            <div className="admin-stats-grid" id="course-payments">
              <AdminMetric
                icon={Users}
                label="Enrollments"
                value={course.enrolledCount}
              />
              <AdminMetric
                icon={BookOpen}
                label="Published curriculum"
                value={`${course.modulesCount} modules · ${course.lessonsCount} lessons`}
              />
              <AdminMetric
                icon={CreditCard}
                label="Organization earnings"
                value={money(course.organizationRevenue, course.currency)}
                detail="85% of completed learner payments"
              />
            </div>
            <div className="account-columns">
              <section className="admin-card">
                <h2 className="text-sm font-semibold">Course details</h2>
                <p className="text-sm leading-7 text-slate-500 mt-4">
                  {course.description || 'No description recorded.'}
                </p>
                <dl className="finance-breakdown">
                  <div>
                    <dt>Category</dt>
                    <dd>{course.category || 'Not recorded'}</dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>{course.level || 'Not recorded'}</dd>
                  </div>
                  <div>
                    <dt>Enrollment price</dt>
                    <dd>{money(course.price, course.currency)}</dd>
                  </div>
                </dl>
              </section>
              <section className="admin-card">
                <div className="admin-section-header">
                  <h2>Assigned instructors</h2>
                  <Link
                    className="admin-button"
                    to={`/org/courses/assign?courseId=${id}`}
                  >
                    Assign
                  </Link>
                </div>
                {course.instructors.map((i) => (
                  <div className="course-teacher-row" key={i.id}>
                    <span className="admin-avatar">{i.name?.charAt(0)}</span>
                    <div>
                      <strong>{i.name}</strong>
                      <small>{i.email}</small>
                    </div>
                  </div>
                ))}
                {!course.instructors.length && (
                  <AdminEmpty title="No instructors assigned" />
                )}
              </section>
            </div>
            <section className="admin-card">
              <h2 className="text-sm font-semibold mb-5">
                Learners enrolled in this course
              </h2>
              <div className="operations-table-scroll">
                <table className="operations-table">
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.learners.map((l) => (
                      <tr key={l.enrollmentId}>
                        <td>
                          <strong>{l.name}</strong>
                          <small>{l.email}</small>
                        </td>
                        <td>{l.progress}%</td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        <td>
                          <Link
                            className="admin-button"
                            to={`/org/learners/${l.id}`}
                          >
                            View learner
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!course.learners.length && (
                <AdminEmpty title="No learners enrolled yet" />
              )}
            </section>
            <ModuleRequests courseId={id} embedded />
            <section className="admin-card">
              <h2 className="text-sm font-semibold mb-5">
                Approved course content
              </h2>
              <div className="grid gap-4">
                {(course.modules || []).map((m, i) => (
                  <article className="finance-summary-card" key={m.id || i}>
                    <h3>
                      {i + 1}. {m.title}
                    </h3>
                    <div className="course-lesson-list">
                      {(Array.isArray(m.items)
                        ? m.items
                        : Array.isArray(m.lessons)
                          ? m.lessons
                          : []
                      ).map((l, n) => (
                        <p key={l.id || n}>
                          <span>
                            {n + 1}. {l.title || l.name}
                          </span>
                          <small>{l.type}</small>
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              {!course.modules?.length && (
                <AdminEmpty
                  title="No approved modules yet"
                  description="Assigned instructors can prepare content and submit it for your approval."
                />
              )}
            </section>
          </>
        )}
      </div>
    </OrgLayout>
  );
}
