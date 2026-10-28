import SearchableSelect from '../../components/common/SearchableSelect';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Receipt, Clock3, X } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import PaymentCard from '../../components/student/PaymentCard';
import { useRemoteData } from '../../hooks/useRemoteData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  AdminHeader,
  AdminMetric,
  AdminDataState,
  AdminSearch,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/admin/Pagination';
import { money } from '../../utils/adminDisplay';
export default function Billing() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const settled = useDebouncedValue(search);
  const query = new URLSearchParams({
    search: settled,
    status: params.get('status') || '',
    organizationId: params.get('organizationId') || '',
    year: params.get('year') || '',
    page: params.get('page') || '1',
    limit: 9,
  });
  const state = useRemoteData(`/student/billing?${query}`);
  const data = state.data;
  const loading = state.loading || search !== settled;
  const active = ['q', 'status', 'organizationId', 'year'].some((k) =>
    params.get(k),
  );
  function update(key, value) {
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true },
    );
  }
  return (
    <StudentPage>
      <AdminHeader title="Billing & payments" />
      {data && !state.error && (
        <div className="admin-stats-grid">
          <AdminMetric
            icon={CreditCard}
            label="Total paid"
            value={
              data.summary.totals.length
                ? data.summary.totals.map((t) => (
                    <div key={t.currency || 'none'}>
                      {money(t.amount, t.currency)}
                    </div>
                  ))
                : money(0, data.summary.currency)
            }
          />
          <AdminMetric
            icon={Receipt}
            label="Completed payments"
            value={data.summary.completedPayments}
          />
          <AdminMetric
            icon={Clock3}
            label="Pending payments"
            value={data.summary.pendingPayments}
          />
        </div>
      )}
      <section className="admin-card learner-filter-panel">
        <AdminSearch
          value={search}
          onChange={(value) => update('q', value)}
          label="Search your payments"
          placeholder="Search course, institute or payment reference…"
        />
        <div className="learner-filter-grid is-billing">
          <label>
            Payment status
            <select
              className="admin-input"
              value={params.get('status') || ''}
              onChange={(e) => update('status', e.target.value)}
            >
              <option value="">Any status</option>
              {data?.facets.statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <SearchableSelect
            label="Institute"
            value={params.get('organizationId') || ''}
            onChange={(v) => update('organizationId', v)}
            options={[
              { value: '', label: 'All institutes' },
              ...(data?.facets.organizations || []).map((o) => ({
                value: o.id,
                label: o.name,
              })),
            ]}
          />
          <label>
            Payment year
            <select
              className="admin-input"
              value={params.get('year') || ''}
              onChange={(e) => update('year', e.target.value)}
            >
              <option value="">All years</option>
              {data?.facets.years.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
        {active && (
          <footer>
            <span>Filtered payment history</span>
            <button
              className="admin-button"
              onClick={() => setParams({}, { replace: true })}
            >
              <X size={13} />
              Clear filters
            </button>
          </footer>
        )}
      </section>
      <AdminDataState
        loading={loading}
        error={state.error}
        refresh={state.refresh}
      />
      {data && !state.error && !loading && (
        <>
          <div className="learner-results-heading">
            <span>
              {data.total} matching {data.total === 1 ? 'payment' : 'payments'}{' '}
              · {data.summary.transactions} total
            </span>
            <span>
              Page {data.page} of {data.totalPages}
            </span>
          </div>
          <div className="admin-grid">
            {data.items.map((p) => (
              <PaymentCard
                payment={p}
                key={p.id}
              />
            ))}
          </div>
          {!data.items.length && (
            <AdminEmpty
              icon={CreditCard}
              title={
                data.summary.transactions
                  ? 'No matching payments'
                  : 'No payments yet'
              }
              description={
                data.summary.transactions
                  ? 'Try a different search or clear a filter.'
                  : 'Paid course purchases and their receipts will appear here.'
              }
            />
          )}
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => update('page', page)}
          />
        </>
      )}
    </StudentPage>
  );
}
