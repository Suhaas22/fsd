import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, ArrowUpRight, Clock3 } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  AdminHeader,
  AdminSearch,
  AdminMetric,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
export default function Courses() {
  const [search, setSearch] = useState('');
  const settled = useDebouncedValue(search),
    state = useRemoteData(
      `/courses/organization/list?${new URLSearchParams({ search: settled })}`,
    ),
    data = state.data;
  return (
    <OrgLayout>
      <div className="admin-page">
        <AdminHeader title="Courses">
          <Link
            className="admin-button admin-button-primary"
            to="/org/courses/create"
          >
            <Plus size={15} />
            Create course
          </Link>
        </AdminHeader>
        <AdminDataState {...state} />
        {data && !state.error && (
          <>
            <div className="admin-stats-grid org-summary">
              <AdminMetric
                icon={BookOpen}
                label="Current courses"
                value={data.counts.active}
              />
              <AdminMetric
                icon={BookOpen}
                label="Published"
                value={data.counts.published}
              />
              <AdminMetric
                icon={Clock3}
                label="Pending approval"
                value={data.counts.pending}
              />
            </div>
            <div className="admin-toolbar">
              <AdminSearch
                value={search}
                onChange={setSearch}
                placeholder="Search course or instructor…"
              />
            </div>
            <div className="admin-grid">
              {data.items.map((c) => (
                <article
                  className="admin-card admin-record"
                  key={c.id}
                >
                  <div className="admin-record-top">
                    <span className="admin-icon-tile admin-icon-green">
                      <BookOpen size={20} />
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h2 className="text-base font-semibold mt-5">{c.title}</h2>
                  <p className="admin-muted mt-3">
                    {c.instructors.map((i) => i.name).join(', ') ||
                      'No assigned instructors'}
                  </p>
                  <p className="admin-muted mt-3">
                    {c.enrolledCount} enrollments
                  </p>
                  <div className="admin-record-footer">
                    <Link
                      className="admin-button"
                      to={`/org/courses/${c.id}`}
                    >
                      View course
                      <ArrowUpRight size={14} />
                    </Link>
                    <Link
                      className="admin-button"
                      to={`/org/courses/${c.id}/edit`}
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            {!data.items.length && (
              <AdminEmpty title="No courses match your search" />
            )}
          </>
        )}
      </div>
    </OrgLayout>
  );
}
