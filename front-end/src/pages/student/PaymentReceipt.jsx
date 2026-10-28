import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminHeader, AdminDataState } from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { money, dateLabel } from '../../utils/adminDisplay';
export default function PaymentReceipt() {
  const { paymentId } = useParams();
  const state = useRemoteData(
    `/student/payments/${encodeURIComponent(paymentId)}`
  );
  const p = state.data;
  return (
    <StudentPage>
      <Link className="admin-count-label print:hidden" to="/student/billing">
        <ArrowLeft size={14} />
        Billing & payments
      </Link>
      <AdminHeader title="Payment details" />
      <AdminDataState {...state} />
      {p && !state.error && (
        <section className="admin-card learner-receipt">
          <div className="flex justify-between items-start gap-4">
            <span className="admin-icon-tile admin-icon-green">
              <Receipt size={24} />
            </span>
            <StatusBadge status={p.status} />
          </div>
          <p className="learner-kicker mt-6">
            {['Completed', 'Paid', 'Success'].includes(p.status)
              ? 'Payment receipt'
              : 'Payment record'}
          </p>
          <h2>{money(p.amount, p.currency)}</h2>
          <h3 className="text-base font-semibold mt-3">{p.course}</h3>
          {p.enrollmentId && p.courseAvailable && (
            <Link
              className="admin-button mt-4"
              to={`/student/learn/${p.courseId}`}
            >
              Open enrolled course
            </Link>
          )}
          <dl className="finance-breakdown">
            {[
              ['Payment reference', p.reference || p.id],
              ['Billed to', p.payer],
              ['Organization', p.organizationName],
              ['Payment method', p.method],
              ['Date', dateLabel(p.createdAt || p.date)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || 'Not recorded'}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </StudentPage>
  );
}
