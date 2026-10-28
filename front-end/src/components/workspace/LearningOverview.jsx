import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowUpRight, Users, Award, Layers } from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminMetric,
  AdminDataState,
  AdminEmpty,
} from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
export default function LearningOverview({ role }) {
  const state = useRemoteData('/workspace/overview');
  const data = state.data;
  const target = (id) =>
    role === 'Student'
      ? `/student/learn/${id}`
      : role === 'Instructor'
        ? `/instructor/courses/${id}/content`
        : `/org/courses/${id}`;
  return (
    <div className="admin-page dashboard-page">
      <AdminHeader title="Overview" />
      <AdminDataState {...state} />
      {data && !state.error && (
        <>
          <div className="admin-stats-grid">
            {data.stats.map((s, i) => (
              <AdminMetric
                key={s.label}
                label={s.label}
                value={s.value}
                icon={[BookOpen, Users, Award, Layers][i]}
              />
            ))}
          </div>
          <section>
            <div className="admin-section-header">
              <h2>{role === 'Student' ? 'My learning' : 'Courses'}</h2>
              {role === 'Student' && (
                <Link
                  className="admin-button"
                  to="/student/explore"
                >
                  Explore courses
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
            <div className="admin-grid">
              {data.courses
                .filter((c) => c.contentAvailable !== false)
                .map((c) => (
                  <article
                    className="admin-card admin-record"
                    key={c.id}
                  >
                    <div className="admin-record-top">
                      <span className="admin-icon-tile admin-icon-green">
                        <BookOpen size={20} />
                      </span>
                      <StatusBadge
                        status={
                          role === 'Student'
                            ? c.enrollmentStatus || c.status
                            : c.status
                        }
                      />
                    </div>
                    <p className="admin-record-category">
                      {c.category || 'Course'}
                    </p>
                    <h2 className="mt-3 text-sm font-semibold leading-6">
                      {c.title}
                    </h2>
                    {c.progress !== null ? (
                      <div className="mt-5">
                        <div className="flex justify-between text-xs text-slate-500 mb-3">
                          <span>Progress</span>
                          <span>{c.progress}%</span>
                        </div>
                        <progress
                          className="w-full h-1 accent-[#648953]"
                          value={c.progress}
                          max="100"
                          aria-label="Course progress"
                        />
                      </div>
                    ) : (
                      <p className="admin-record-meta mt-5">
                        {c.enrollments} enrollments
                      </p>
                    )}
                    <div className="admin-record-footer mt-5">
                      <Link to={target(c.id)}>
                        {role === 'Student'
                          ? 'Continue learning'
                          : 'View course'}
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
            </div>
            {!data.courses.length && (
              <AdminEmpty
                icon={BookOpen}
                title="No courses yet"
                description={
                  role === 'Student'
                    ? 'Your enrolled courses will appear here.'
                    : 'Assigned courses will appear here.'
                }
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
