import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import OrgLayout from '../organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminHeader, AdminDataState } from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
import { money, timestampLabel } from '../../utils/adminDisplay';
export default function LogDetails({ organization = false }) {
  const { id } = useParams(),
    { pathname } = useLocation();
  const prefix = organization
    ? '/org'
    : pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';
  const state = useRemoteData(`/workspace/logs/${encodeURIComponent(id)}`),
    r = state.data;
  const content = (
    <div className="admin-page">
      <Link className="admin-count-label" to={`${prefix}/logs`}>
        Back to logs
      </Link>
      <AdminHeader title="Activity record" />
      <AdminDataState {...state} />
      {r && !state.error && (
        <section className="admin-card">
          <h2 className="text-lg font-semibold">{r.title}</h2>
          <p className="admin-muted mt-4">{r.details}</p>
          <dl className="finance-breakdown">
            <div>
              <dt>Actor</dt>
              <dd>
                {r.actorName} · {r.actorRole}
              </dd>
            </div>
            <div>
              <dt>Recorded</dt>
              <dd>{timestampLabel(r.createdAt)}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{r.category}</dd>
            </div>
            {r.amount !== undefined && (
              <div>
                <dt>Amount</dt>
                <dd>{money(r.amount, r.currency)}</dd>
              </div>
            )}
            {r.method && (
              <div>
                <dt>Method</dt>
                <dd>{r.method}</dd>
              </div>
            )}
            {r.reference && (
              <div>
                <dt>Reference</dt>
                <dd>{r.reference}</dd>
              </div>
            )}
            {r.status && (
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={r.status} />
                </dd>
              </div>
            )}
          </dl>
          {r.href !== `${prefix}/logs/${encodeURIComponent(id)}` && (
            <Link className="admin-button mt-5" to={r.href}>
              Open related record
            </Link>
          )}
        </section>
      )}
    </div>
  );
  return organization ? <OrgLayout>{content}</OrgLayout> : content;
}
