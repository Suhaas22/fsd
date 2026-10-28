import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, Clock } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminDataState,
  AdminMetric,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { dateLabel } from '../../utils/adminDisplay';
export default function LearnerDetails() {
  const { id } = useParams();
  const state = useRemoteData(`/workspace/organization/learners/${id}`);
  const data = state.data;
  return (
    <OrgLayout>
      <div className="admin-page">
        <Link className="admin-count-label" to="/org/learners">
          <ArrowLeft size={14} />
          Learners
        </Link>
        <AdminDataState {...state} />
        {data && !state.error && (
          <>
            <AdminHeader title={data.learner.name} />
            <section className="admin-card">
              <p className="admin-muted">{data.learner.email}</p>
              <StatusBadge status={data.learner.status} />
            </section>
            <div className="admin-stats-grid">
              <AdminMetric
                icon={BookOpen}
                label="Enrollments"
                value={data.stats.enrollments}
              />
              <AdminMetric
                icon={Award}
                label="Certificates"
                value={data.stats.certificates}
              />
            </div>
            <section className="admin-card">
              <h2 className="text-sm font-semibold mb-5">Course enrollments</h2>
              <div className="admin-grid">
                {data.enrollments.map((e) => (
                  <article className="finance-summary-card" key={e.id}>
                    <h3>{e.courseTitle}</h3>
                    <p className="admin-muted mt-3">{e.progress}% completed</p>
                    <StatusBadge
                      status={
                        e.courseStatus === 'Archived' ? 'Archived' : e.status
                      }
                    />
                    <Link
                      to={`/org/courses/${e.courseId}`}
                      className="admin-button mt-4"
                    >
                      View course
                    </Link>
                  </article>
                ))}
              </div>
            </section>
            <section className="admin-card">
              <h2 className="text-sm font-semibold mb-5">Recorded activity</h2>
              {data.activity.map((e) => (
                <article className="settings-row" key={e.id}>
                  <div>
                    <h3>{e.courseTitle}</h3>
                    <p>
                      {e.seconds} seconds · {dateLabel(e.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
              {!data.activity.length && (
                <AdminEmpty title="No learning activity recorded yet" />
              )}
            </section>
            <section className="admin-card">
              <h2 className="text-sm font-semibold mb-5">Certificates</h2>
              {data.certificates.map((c) => (
                <article className="settings-row" key={c.id}>
                  <div>
                    <h3>{c.courseTitle}</h3>
                    <p>{c.credentialId || c.id}</p>
                  </div>
                </article>
              ))}
              {!data.certificates.length && (
                <AdminEmpty title="No certificates earned yet" />
              )}
            </section>
          </>
        )}
      </div>
    </OrgLayout>
  );
}
