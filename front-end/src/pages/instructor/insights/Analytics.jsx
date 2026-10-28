import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle2 } from 'lucide-react';
import { useRemoteData } from '../../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminMetric,
  AdminDataState,
} from '../../../components/admin/AdminUI';
export function Analytics({ dashboard = false }) {
  const state = useRemoteData('/workspace/instructor');
  const data = state.data;
  return (
    <div className="admin-page dashboard-page">
      <AdminHeader title={dashboard ? 'Overview' : 'Course analytics'} />
      <AdminDataState {...state} />
      {data && !state.error && (
        <>
          <div className="admin-stats-grid instructor-summary">
            <AdminMetric
              icon={BookOpen}
              label="Assigned courses"
              value={data.stats.courses}
            />
            <AdminMetric
              icon={Users}
              label="Learners"
              value={data.stats.learners}
            />
            <AdminMetric
              icon={CheckCircle2}
              label="Completed enrollments"
              value={data.stats.completedEnrollments}
            />
          </div>
          <section className="admin-card">
            <h2 className="text-sm font-semibold mb-5">Course performance</h2>
            <div className="admin-grid">
              {data.courses.map((c) => (
                <article className="finance-summary-card" key={c.id}>
                  <h3>
                    <Link
                      className="dashboard-course-title"
                      to={`/instructor/courses/${c.id}/content`}
                    >
                      {c.title}
                    </Link>
                  </h3>
                  <dl className="finance-breakdown">
                    <div>
                      <dt>Enrollments</dt>
                      <dd>{c.enrolledCount}</dd>
                    </div>
                    <div>
                      <dt>Completion</dt>
                      <dd>{c.completionRate}%</dd>
                    </div>
                    <div>
                      <dt>Review rating</dt>
                      <dd>
                        {c.rating === null ? 'Not rated' : c.rating.toFixed(1)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
