import React from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, Receipt, BookOpen } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminDataState, AdminEmpty } from '../../components/admin/AdminUI';
import { money, dateLabel } from '../../utils/adminDisplay';
export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const location = useLocation();
  const id = params.get('transactionId') || location.state?.transactionId;
  return id ? (
    <ConfirmedPayment id={id} />
  ) : (
    <StudentPage>
      <AdminEmpty
        title="No payment reference provided"
        description="Open your billing history to view a recorded payment."
      />
      <Link className="admin-button" to="/student/billing">
        View billing
      </Link>
    </StudentPage>
  );
}
function ConfirmedPayment({ id }) {
  const state = useRemoteData(`/student/payments/${encodeURIComponent(id)}`);
  const p = state.data;
  const complete =
    p &&
    ['completed', 'paid', 'success', 'successful'].includes(
      String(p.status).toLowerCase()
    );
  return (
    <StudentPage>
      <AdminDataState {...state} />
      {p && !state.error && (
        <section className="admin-card learner-payment-confirmation">
          <span className="learner-confirmation-icon">
            <CheckCircle2 size={32} />
          </span>
          <p className="learner-kicker mt-6">
            {complete ? 'Payment confirmed' : 'Payment status'}
          </p>
          <h1>{complete ? 'You’re ready to learn' : p.status}</h1>
          <p className="admin-muted mt-3">{p.course}</p>
          <strong className="learner-payment-amount">
            {money(p.amount, p.currency)}
          </strong>
          <dl className="finance-breakdown">
            {[
              ['Payment reference', p.id],
              ['Payment method', p.method || 'Not recorded'],
              ['Date', dateLabel(p.createdAt || p.date)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex justify-center flex-wrap gap-3 mt-7">
            {complete && p.courseId && p.courseAvailable && p.enrollmentId && (
              <Link
                className="admin-button admin-button-primary"
                to={`/student/learn/${p.courseId}`}
              >
                <BookOpen size={15} />
                Start learning
              </Link>
            )}
            <Link className="admin-button" to={`/student/billing/${p.id}`}>
              <Receipt size={15} />
              View payment
            </Link>
          </div>
        </section>
      )}
    </StudentPage>
  );
}
