import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRemoteData } from '../../../hooks/useRemoteData';
import { AdminHeader, AdminDataState } from '../../../components/admin/AdminUI';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { dateLabel } from '../../../utils/adminDisplay';
export function StudentProgress() {
  const { id } = useParams();
  const state = useRemoteData(
    `/workspace/instructor/learners/${encodeURIComponent(id)}`
  );
  const data = state.data;
  return (
    <div className="admin-page">
      <Link className="admin-count-label" to="/instructor/students">
        <ArrowLeft size={14} />
        Learners
      </Link>
      <AdminDataState {...state} />
      {data && !state.error && (
        <>
          <AdminHeader title={data.learner.name || 'Learner details'} />
          <section className="admin-card">
            <p className="admin-muted">
              {data.learner.email || 'Email not recorded'}
            </p>
            {!data.learner.profileAvailable && (
              <p className="learner-record-note">
                This learner profile is no longer available. Recorded course
                enrollment history is retained.
              </p>
            )}
          </section>
          <h2 className="text-base font-semibold">
            Enrollments in your courses
          </h2>
          <div className="admin-grid">
            {data.enrollments.map((e) => (
              <article className="admin-card" key={e.enrollmentId}>
                <div className="flex justify-between gap-4">
                  <h3 className="font-semibold text-sm">{e.course}</h3>
                  <StatusBadge status={e.status} />
                </div>
                <dl className="finance-breakdown">
                  <div>
                    <dt>Progress</dt>
                    <dd>{e.progress}%</dd>
                  </div>
                  <div>
                    <dt>Completed lessons</dt>
                    <dd>
                      {e.completionTracked
                        ? `${e.completedLessons.length} of ${e.totalLessons}`
                        : 'Detailed tracking not recorded'}
                    </dd>
                  </div>
                  <div>
                    <dt>Enrolled</dt>
                    <dd>
                      {dateLabel(e.enrolledAt || e.enrolledDate || e.createdAt)}
                    </dd>
                  </div>
                </dl>
                <progress
                  className="w-full h-1 mt-5 accent-[#61864e]"
                  value={e.progress}
                  max="100"
                  aria-label="Course progress"
                />
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
