import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Building2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminSearch,
  AdminEmpty,
  AdminDataState,
} from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
export default function AccountDirectory({ fixedRole, superAdmin = false }) {
  const [params, setParams] = useSearchParams();
  const role =
    fixedRole ||
    (params.get('role') === 'Organization' ? 'Organization' : 'Learner');
  const state = useRemoteData(`/admin/accounts?role=${role}`);
  const [search, setSearch] = useState('');
  const records = (state.data?.items || []).filter((u) =>
    `${u.name || ''} ${u.email || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const title =
    role === 'Admin'
      ? 'Administrators'
      : role === 'Organization'
        ? 'Organizations'
        : 'Learners';
  const section =
    role === 'Admin'
      ? 'admins'
      : role === 'Organization'
        ? 'organizations'
        : 'learners';
  const detail = (id) =>
    superAdmin ? `/super-admin/${section}/${id}` : `/admin/users/${id}`;
  return (
    <div className="admin-page">
      <AdminHeader title={fixedRole ? title : 'Users'} />
      {!fixedRole && (
        <div className="directory-role-grid">
          {[
            ['Learner', 'Learners', Users],
            ['Organization', 'Organizations', Building2],
          ].map(([value, label, Icon]) => (
            <button
              key={value}
              aria-pressed={role === value}
              onClick={() => setParams({ role: value })}
              className="admin-card"
            >
              <Icon size={22} />
              <strong>{state.data?.counts?.[value] ?? '—'}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="admin-toolbar">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label={`Search ${title}`}
          placeholder="Search by name or email…"
        />
        <span className="admin-count-label">
          {records.length} {title.toLowerCase()}
        </span>
      </div>
      <AdminDataState {...state} />
      {!state.loading && !state.error && (
        <div className="admin-grid">
          {records.map((u) => (
            <Link
              to={detail(u.id)}
              className="admin-card admin-record admin-card-link"
              key={u.id}
            >
              <div className="admin-record-top">
                <span className="admin-avatar">{u.name?.charAt(0) || '?'}</span>
                <StatusBadge status={u.status || 'Not recorded'} />
              </div>
              <h2 className="text-base font-semibold mt-5">{u.name}</h2>
              <p className="admin-muted mt-2 break-all">
                {u.email || 'Email not recorded'}
              </p>
              <div className="admin-record-footer mt-6">
                <span>
                  {role === 'Organization'
                    ? 'Courses and instructors'
                    : role === 'Admin'
                      ? 'Activity and assigned cases'
                      : 'Enrolled courses and progress'}
                </span>
                <ArrowUpRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
      {!state.loading && !state.error && !records.length && (
        <AdminEmpty
          icon={role === 'Admin' ? ShieldCheck : Users}
          title={`No ${title.toLowerCase()} found`}
          description="Try another name or email."
        />
      )}
    </div>
  );
}
