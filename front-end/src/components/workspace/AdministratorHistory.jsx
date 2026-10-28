import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Pagination } from '../admin/Pagination';
import { timestampLabel } from '../../utils/adminDisplay';
import React, { useState } from 'react';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminSearch,
  AdminDataState,
  AdminEmpty,
} from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
import { dateLabel } from '../../utils/adminDisplay';
export function HistoryRecords({ data }) {
  return (
    <div className="grid gap-6">
      <section className="admin-card">
        <h2 className="text-base font-semibold mb-5">Administrator actions</h2>
        {data.actions.length ? (
          <div className="operations-list">
            {data.actions.map((a) => (
              <article key={a.id}>
                <span className="operations-dot" />
                <div>
                  <h3>{a.action}</h3>
                  <p>
                    {a.adminName}
                    {a.details ? ` · ${a.details}` : ''}
                  </p>
                </div>
                <time>{dateLabel(a.date)}</time>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-muted">No actions recorded yet.</p>
        )}
      </section>
      <section>
        <h2 className="text-base font-semibold mb-4">
          Disputes and assigned work
        </h2>
        <div className="admin-grid">
          {data.cases.map((c) => (
            <article
              className="admin-card"
              key={c.id}
            >
              <div className="flex justify-between gap-3">
                <span className="admin-record-code">{c.id}</span>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="font-semibold mt-4 text-sm">{c.subject}</h3>
              <p className="admin-muted mt-3">
                {c.assignedName
                  ? `Handled by ${c.assignedName}`
                  : 'Not assigned yet'}
              </p>
              {c.resolution && (
                <p className="admin-muted mt-3 whitespace-pre-wrap">
                  {c.resolution}
                </p>
              )}
              <p className="admin-muted mt-3">
                Updated {dateLabel(c.updatedAt)}
              </p>
            </article>
          ))}
        </div>
        {!data.cases.length && (
          <AdminEmpty
            title="No disputes recorded"
            description="Assigned cases and recorded decisions will appear here."
          />
        )}
      </section>
    </div>
  );
}
export default function AdministratorHistory() {
  const [view, setView] = useState('actions'),
    [search, setSearch] = useState(''),
    [searchBy, setSearchBy] = useState('all'),
    [adminId, setAdminId] = useState(''),
    [courseId, setCourseId] = useState(''),
    [order, setOrder] = useState('newest'),
    [page, setPage] = useState(1),
    [status, setStatus] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState('');
  const [adminQuery, setAdminQuery] = useState(''),
    [courseQuery, setCourseQuery] = useState('');
  const term = useDebouncedValue(search),
    adminTerm = useDebouncedValue(adminQuery),
    courseTerm = useDebouncedValue(courseQuery);
  const state = useRemoteData(
      `/admin/history?${new URLSearchParams({ view, search: term, searchBy, adminId, courseId, order, page, status, from, to, limit: 15 })}`,
    ),
    data = state.data;
  const adminOptions = useRemoteData(
    `/admin/history/options?${new URLSearchParams({ type: 'administrator', search: adminTerm, selected: adminId })}`,
  );
  const courseOptions = useRemoteData(
    `/admin/history/options?${new URLSearchParams({ type: 'course', search: courseTerm, selected: courseId })}`,
  );
  function filter(set, value) {
    set(value);
    setPage(1);
  }
  function reset() {
    setSearch('');
    setSearchBy('all');
    setAdminId('');
    setCourseId('');
    setOrder('newest');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(1);
  }
  return (
    <div className="admin-page">
      <AdminHeader title="Admin activity" />
      <div
        className="workspace-tabs"
        aria-label="Activity view"
      >
        <button
          aria-pressed={view === 'actions'}
          onClick={() => filter(setView, 'actions')}
        >
          Actions{data ? ` · ${data.actionsTotal}` : ''}
        </button>
        <button
          aria-pressed={view === 'cases'}
          onClick={() => filter(setView, 'cases')}
        >
          Disputes & assigned work{data ? ` · ${data.casesTotal}` : ''}
        </button>
      </div>
      <section className="admin-card history-filter-panel">
        <div className="history-search-row">
          <AdminSearch
            value={search}
            onChange={(v) => filter(setSearch, v)}
            placeholder={
              searchBy === 'course'
                ? 'Search course name…'
                : searchBy === 'administrator'
                  ? 'Search administrator name…'
                  : 'Search activity…'
            }
            label="Search admin activity"
          />
          <label>
            Search in
            <select
              className="admin-input"
              value={searchBy}
              onChange={(e) => filter(setSearchBy, e.target.value)}
            >
              <option value="all">All fields</option>
              <option value="administrator">Administrator name</option>
              <option value="course">Course name</option>
              <option value="organization">Organization</option>
              <option value="action">Action or case</option>
            </select>
          </label>
        </div>
        <div className="history-filter-grid">
          <SearchableSelect
            label="Administrator"
            placeholder="All administrators"
            value={adminId}
            onChange={(v) => filter(setAdminId, v)}
            options={[
              { value: '', label: 'All administrators' },
              ...(adminOptions.data?.items || []),
            ]}
            onSearchChange={setAdminQuery}
            loading={adminOptions.loading}
            searchPlaceholder="Search administrator names…"
          />
          <SearchableSelect
            label="Course"
            placeholder="All courses"
            value={courseId}
            onChange={(v) => filter(setCourseId, v)}
            options={[
              { value: '', label: 'All courses' },
              ...(courseOptions.data?.items || []),
            ]}
            onSearchChange={setCourseQuery}
            loading={courseOptions.loading}
            searchPlaceholder="Search course names…"
          />
          <label>
            Order
            <select
              className="admin-input"
              value={order}
              onChange={(e) => filter(setOrder, e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="administrator">Administrator A–Z</option>
              <option value="course">Course A–Z</option>
            </select>
          </label>
          {view === 'cases' && (
            <label>
              Status
              <select
                className="admin-input"
                value={status}
                onChange={(e) => filter(setStatus, e.target.value)}
              >
                <option value="">All statuses</option>
                {data?.statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            From
            <input
              type="date"
              className="admin-input"
              value={from}
              max={to || undefined}
              onChange={(e) => filter(setFrom, e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              className="admin-input"
              value={to}
              min={from || undefined}
              onChange={(e) => filter(setTo, e.target.value)}
            />
          </label>
        </div>
        <button
          className="history-reset"
          onClick={reset}
        >
          Clear filters
        </button>
        {(adminOptions.error || courseOptions.error) && (
          <p
            className="workspace-error"
            role="alert"
          >
            {adminOptions.error || courseOptions.error}
          </p>
        )}
      </section>
      <AdminDataState {...state} />
      {data && !state.error && (
        <>
          <section className="admin-card">
            <div className="admin-section-header">
              <h2>
                {view === 'actions'
                  ? 'Administrator actions'
                  : 'Disputes & assigned work'}
              </h2>
              <span className="admin-muted">{data.total} records</span>
            </div>
            <div className="operations-table-scroll">
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>{view === 'actions' ? 'Action' : 'Case'}</th>
                    <th>Administrator</th>
                    <th>Course / organization</th>
                    <th>{view === 'actions' ? 'Recorded' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(view === 'actions' ? data.actions : data.cases).map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.href ? (
                          <Link
                            className="history-action-link"
                            to={r.href}
                          >
                            <strong>{r.action || r.subject}</strong>
                            <ArrowUpRight size={14} />
                          </Link>
                        ) : (
                          <strong>{r.action || r.subject}</strong>
                        )}
                        <small>{r.details || r.resolution}</small>
                      </td>
                      <td>{r.adminName || r.assignedName || 'Not assigned'}</td>
                      <td>
                        {r.courseTitle || '—'}
                        {r.organizationName && (
                          <small>{r.organizationName}</small>
                        )}
                      </td>
                      <td>
                        {view === 'actions' ? (
                          timestampLabel(r.date)
                        ) : (
                          <>
                            <StatusBadge status={r.status} />
                            <small>{timestampLabel(r.updatedAt)}</small>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!(view === 'actions' ? data.actions : data.cases).length && (
              <AdminEmpty title="No activity matches these filters" />
            )}
          </section>
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
