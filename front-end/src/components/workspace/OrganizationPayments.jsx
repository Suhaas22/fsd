import React, { useEffect } from 'react';
import { CreditCard, ArrowDownLeft, X } from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminDataState, AdminEmpty } from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
import { money, timestampLabel } from '../../utils/adminDisplay';
export default function OrganizationPayments({ onClose }) {
  useEffect(() => {
    document
      .getElementById('organization-payments')
      ?.scrollIntoView({ block: 'start' });
  }, []);
  const state = useRemoteData('/workspace/organization/payments'),
    data = state.data;
  return (
    <section
      className="admin-card organization-payments"
      id="organization-payments"
    >
      <div className="admin-section-header">
        <h2>
          <CreditCard size={18} />
          Payments from Acadex
        </h2>
        <button
          className="admin-button"
          onClick={onClose}
          aria-label="Close received payments"
        >
          <X size={16} />
        </button>
      </div>
      <AdminDataState {...state} />
      {data && !state.error && (
        <>
          <div className="admin-grid">
            {data.summaries.map((g) => (
              <article
                className="finance-summary-card"
                key={g.currency || 'unknown'}
              >
                <h3>{g.currency || 'Currency not recorded'}</h3>
                <dl className="finance-breakdown">
                  <div>
                    <dt>Organization earnings</dt>
                    <dd>{money(g.organizationShare, g.currency)}</dd>
                  </div>
                  <div>
                    <dt>Received from Acadex admin</dt>
                    <dd>{money(g.paid, g.currency)}</dd>
                  </div>
                  <div>
                    <dt>Awaiting payment</dt>
                    <dd>{money(g.due, g.currency)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="operations-table-scroll mt-5">
            <table className="operations-table">
              <thead>
                <tr>
                  <th>Transfer</th>
                  <th>Amount received</th>
                  <th>Recorded by</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.reference || p.id}</strong>
                      <small>
                        <ArrowDownLeft size={12} /> {p.method}
                      </small>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{money(p.amount, p.currency)}</td>
                    <td>{p.recordedByName}</td>
                    <td>{timestampLabel(p.createdAt || p.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length && (
            <AdminEmpty
              title="No payments received yet"
              description="Completed transfers from Acadex will appear here."
            />
          )}
        </>
      )}
    </section>
  );
}
