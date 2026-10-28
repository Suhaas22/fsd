import LoggedModuleRequest from '../../components/workspace/LoggedModuleRequest';
import React from 'react';
import {
  Link,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import {
  BookOpen,
  Users,
  Layers,
  GraduationCap,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminMetric,
  AdminSectionHeader,
  AdminDataState,
} from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { money, currencyLabel, dateLabel } from '../../utils/adminDisplay';
export const CourseDetails = () => {
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const superAdmin = useLocation().pathname.startsWith('/super-admin');
  const state = useRemoteData(`/admin/courses/${courseId}`);
  if (state.loading || state.error)
    return (
      <div className="admin-page">
        <Link
          className="admin-count-label"
          to={superAdmin ? '/super-admin/logs' : '/admin/courses'}
        >
          <ArrowLeft size={14} />
          Back to courses
        </Link>
        <AdminDataState {...state} />
      </div>
    );
  const c = state.data;
  return (
    <div className="admin-page">
      <Link
        className="admin-count-label"
        to={superAdmin ? '/super-admin/logs' : '/admin/courses'}
      >
        <ArrowLeft size={14} />
        Back to courses
      </Link>
      <AdminHeader
        eyebrow={c.category || 'Course details'}
        title={c.title}
        description={c.organizationName || 'Organization not recorded'}
      >
        <StatusBadge status={c.status} />
        {!superAdmin && c.status === 'Pending Approval' && (
          <Link
            className="admin-button admin-button-primary"
            to="/admin/courses/approval"
          >
            Review course
            <ArrowUpRight size={14} />
          </Link>
        )}
      </AdminHeader>
      {params.get('requestId') && (
        <LoggedModuleRequest id={params.get('requestId')} />
      )}
      <div className="admin-stats-grid">
        <AdminMetric
          icon={Users}
          label="Enrollments"
          value={c.enrolledCount}
        />
        <AdminMetric
          icon={GraduationCap}
          label="Completed"
          value={c.completedCount}
          accent="blue"
        />
        <AdminMetric
          icon={Layers}
          label="Modules"
          value={c.modulesCount}
          accent="amber"
        />
        <AdminMetric
          icon={BookOpen}
          label="Lessons"
          value={c.lessonsCount}
          detail={c.duration}
        />
      </div>
      <div className="admin-dashboard-columns">
        <div className="grid gap-5 content-start">
          <section className="admin-card">
            <AdminSectionHeader title="About this course" />
            <p className="admin-muted whitespace-pre-wrap">
              {c.description || 'No course description recorded.'}
            </p>
          </section>
          <section className="admin-card">
            <AdminSectionHeader
              title="Curriculum"
              description={`${c.modulesCount} modules · ${c.lessonsCount} lessons`}
            />
            <div className="grid gap-3">
              {c.modules?.length ? (
                c.modules.map((m, i) => (
                  <article
                    className="border border-[#e7eddf] rounded-xl p-4 flex gap-4 items-center"
                    key={m.id || i}
                  >
                    <span className="admin-icon-tile admin-icon-green text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold">
                        {m.title || `Module ${i + 1}`}
                      </h3>
                      <p className="admin-muted !text-[10px] mt-1">
                        {m.lessonCount} lessons
                        {m.duration ? ` · ${m.duration}` : ''}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="admin-muted">No curriculum recorded.</p>
              )}
            </div>
          </section>
          {c.reviewNote && (
            <section className="admin-card">
              <AdminSectionHeader title="Review note" />
              <p className="admin-muted whitespace-pre-wrap">{c.reviewNote}</p>
            </section>
          )}
        </div>
        <div className="grid gap-5 content-start">
          <section className="admin-card">
            <AdminSectionHeader title="Course information" />
            <dl className="grid gap-5">
              {[
                ['Level', c.level || 'Not recorded'],
                ['Price', money(c.price, c.currency)],
                ['Currency', currencyLabel(c.currency)],
                [
                  'Learner rating',
                  c.reviewCount
                    ? `${Number(c.rating).toFixed(1)} / 5 · ${c.reviewCount} reviews`
                    : 'No learner reviews',
                ],
                ['Created', dateLabel(c.createdAt)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 text-xs"
                >
                  <dt className="text-[#7c8b74]">{label}</dt>
                  <dd className="text-right text-[#53694b]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="admin-card">
            <AdminSectionHeader
              title="Teaching team"
              description="Assigned instructors"
            />
            {c.instructors?.length ? (
              c.instructors.map((i) => (
                <article
                  className="admin-user-row"
                  key={i.id}
                >
                  <span className="admin-avatar">
                    {i.name?.charAt(0) || '?'}
                  </span>
                  <div>
                    <strong>{i.name}</strong>
                    <small>{i.email || 'Email not recorded'}</small>
                  </div>
                </article>
              ))
            ) : (
              <p className="admin-muted">No instructors assigned.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
