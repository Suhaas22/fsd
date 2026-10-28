import { useLocation, useSearchParams } from 'react-router-dom';
import React, { useState } from 'react';
import {
  CreditCard,
  Users,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  X,
} from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../services/api';
import { money, timestampLabel } from '../../utils/adminDisplay';
import {
  AdminHeader,
  AdminMetric,
  AdminSearch,
  AdminEmpty,
  AdminDataState,
} from './AdminUI';
import { Pagination } from './Pagination';
import { StatusBadge } from './StatusBadge';
import SearchableSelect from '../common/SearchableSelect';
export function PaymentLedger() {
  const [params] = useSearchParams();
  const executive = useLocation().pathname.startsWith('/super-admin');
  const [search, setSearch] = useState(params.get('search') || ''),
    [status, setStatus] = useState(''),
    [type, setType] = useState(
      params.get('type') === 'Payout' ? 'Payout' : 'Payment',
    ),
    [page, setPage] = useState(1);
  const [showTransfer, setShowTransfer] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const [form, setForm] = useState({
    group: '',
    amount: '',
    method: 'Bank transfer',
    reference: '',
  });
  const ledger = useRemoteData(
      `/admin/payments?${new URLSearchParams({ search, status, type, page, limit: 12 })}`,
    ),
    finance = useRemoteData('/admin/finance'),
    data = finance.data;
  const groups = data?.organizations || [],
    selected = groups.find(
      (g) => `${g.organizationId}:${g.currency}` === form.group,
    ),
    payable = groups.filter(
      (g) => g.status === 'Active' && g.currency && g.due > 0,
    );
  const amountValue = (key) =>
    data?.currencySummaries.length
      ? data.currencySummaries.map((g) => (
          <span
            className="block"
            key={g.currency || 'unknown'}
          >
            {money(g[key], g.currency)}
          </span>
        ))
      : money(0, 'INR');
  function choose(value) {
    const group = groups.find(
      (g) => `${g.organizationId}:${g.currency}` === value,
    );
    setForm((f) => ({ ...f, group: value, amount: group?.due || '' }));
    setError('');
  }
  function open(group) {
    setMessage('');
    setError('');
    setShowTransfer(true);
    setForm({
      group: group ? `${group.organizationId}:${group.currency}` : '',
      amount: group?.due || '',
      method: 'Bank transfer',
      reference: '',
    });
  }
  async function transfer(e) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const result = await api.post('/admin/payouts', {
        organizationId: selected.organizationId,
        currency: selected.currency,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference,
      });
      setShowTransfer(false);
      setType('Payout');
      setPage(1);
      setSearch('');
      setMessage(
        `${money(result.amount, result.currency)} recorded for ${result.organizationName}. Reference: ${result.reference}`,
      );
      finance.refresh();
      ledger.refresh();
      window.dispatchEvent(new Event('learning-data-changed'));
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (e) {
      setError(e.message);
      finance.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-page">
      <AdminHeader title={executive ? 'Platform payments' : 'Payments'}>
        <button
          className="admin-button admin-button-primary"
          disabled={!payable.length || finance.loading}
          onClick={() => open()}
        >
          <Send size={15} />
          Send payment
        </button>
      </AdminHeader>
      <AdminDataState {...finance} />
      {message && (
        <p
          className="admin-success"
          role="status"
        >
          {message}
        </p>
      )}
      {data && !finance.error && (
        <>
          <div className="admin-stats-grid">
            <AdminMetric
              icon={CreditCard}
              label="Learner payments received"
              value={amountValue('gross')}
            />
            <AdminMetric
              icon={Building2}
              label="Sent to organizations"
              value={amountValue('paid')}
            />
            <AdminMetric
              icon={CreditCard}
              label="Pending organization payments"
              value={amountValue('due')}
            />
            <AdminMetric
              icon={executive ? CreditCard : Users}
              label={executive ? 'Platform earnings' : 'Paying learners'}
              value={
                executive ? amountValue('platformMargin') : data.learnerCount
              }
            />
          </div>
          {showTransfer && (
            <section className="admin-card payment-transfer-panel">
              <header>
                <div>
                  <h2>Send payment to organization</h2>
                  <p>
                    Record a completed transfer using its bank or UPI reference.
                  </p>
                </div>
                <button
                  className="admin-button"
                  aria-label="Close payment form"
                  disabled={busy}
                  onClick={() => setShowTransfer(false)}
                >
                  <X size={17} />
                </button>
              </header>
              <form onSubmit={transfer}>
                <div className="payment-transfer-fields">
                  <SearchableSelect
                    label="Organization"
                    required
                    disabled={busy}
                    value={form.group}
                    onChange={choose}
                    placeholder="Select an organization"
                    searchPlaceholder="Search organizations…"
                    options={payable.map((g) => ({
                      value: `${g.organizationId}:${g.currency}`,
                      label: g.name,
                      detail: `${money(g.due, g.currency)} payable`,
                    }))}
                  />
                  <label>
                    Amount{selected ? ` (${selected.currency})` : ''}
                    <input
                      className="admin-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={selected?.due}
                      required
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Method
                    <select
                      className="admin-input"
                      value={form.method}
                      onChange={(e) =>
                        setForm({ ...form, method: e.target.value })
                      }
                    >
                      <option>Bank transfer</option>
                      <option>UPI</option>
                    </select>
                  </label>
                  <label>
                    Transfer reference
                    <input
                      className="admin-input"
                      required
                      maxLength={120}
                      value={form.reference}
                      onChange={(e) =>
                        setForm({ ...form, reference: e.target.value })
                      }
                      placeholder="Bank or UPI transaction reference"
                    />
                  </label>
                </div>
                {selected && (
                  <p className="payment-transfer-note">
                    Organization earnings:{' '}
                    {money(selected.organizationShare, selected.currency)} ·
                    Already sent: {money(selected.paid, selected.currency)} ·
                    Remaining: {money(selected.due, selected.currency)}
                  </p>
                )}
                {error && (
                  <p
                    className="workspace-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <footer>
                  <button
                    type="button"
                    className="admin-button"
                    disabled={busy}
                    onClick={() => setShowTransfer(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="admin-button admin-button-primary"
                    disabled={busy || !selected}
                  >
                    <Send size={15} />
                    {busy ? 'Recording…' : 'Record payment'}
                  </button>
                </footer>
              </form>
            </section>
          )}
          <section className="admin-card">
            <div className="admin-section-header">
              <h2>Organization settlements</h2>
              <span className="admin-muted">
                Earnings, payments and remaining amounts
              </span>
            </div>
            <div className="operations-table-scroll">
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Earned</th>
                    <th>Sent</th>
                    <th>Remaining</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={`${g.organizationId}:${g.currency}`}>
                      <td>
                        <strong>{g.name}</strong>
                        <small>
                          {g.payments} learner payments · {g.learners} learners
                        </small>
                      </td>
                      <td>{money(g.organizationShare, g.currency)}</td>
                      <td>{money(g.paid, g.currency)}</td>
                      <td>{money(g.due, g.currency)}</td>
                      <td>
                        <button
                          className="admin-button"
                          disabled={
                            g.status !== 'Active' || !g.currency || !(g.due > 0)
                          }
                          onClick={() => open(g)}
                        >
                          {g.status !== 'Active'
                            ? 'Account inactive'
                            : g.due > 0
                              ? 'Send payment'
                              : 'Settled'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!groups.length && (
              <AdminEmpty title="No organization earnings yet" />
            )}
          </section>
        </>
      )}
      <div
        className="workspace-tabs"
        aria-label="Payment direction"
      >
        <button
          aria-pressed={type === 'Payment'}
          onClick={() => {
            setType('Payment');
            setPage(1);
            setSearch('');
          }}
        >
          Learner payments
        </button>
        <button
          aria-pressed={type === 'Payout'}
          onClick={() => {
            setType('Payout');
            setPage(1);
            setSearch('');
          }}
        >
          Organization transfers
        </button>
      </div>
      <div className="admin-toolbar">
        <AdminSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={
            type === 'Payment'
              ? 'Search learner, course or reference…'
              : 'Search organization or transfer reference…'
          }
        />
        <select
          className="admin-input"
          aria-label="Payment status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Any status</option>
          {(ledger.data?.statuses || []).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <AdminDataState {...ledger} />
      {!ledger.loading && !ledger.error && (
        <>
          <div className="admin-grid">
            {ledger.data?.items?.map((t) => (
              <article
                className="admin-card admin-record"
                key={t.id}
              >
                <div className="admin-record-top">
                  <span
                    className={`admin-icon-tile ${t.type === 'Payout' ? 'admin-icon-amber' : 'admin-icon-green'}`}
                  >
                    {t.type === 'Payout' ? (
                      <ArrowUpRight size={19} />
                    ) : (
                      <ArrowDownLeft size={19} />
                    )}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="admin-record-category">
                  {t.type === 'Payout'
                    ? 'Acadex → organization'
                    : 'Learner → Acadex'}
                </p>
                <h2 className="font-semibold mt-2 text-sm">
                  {t.type === 'Payout'
                    ? t.organizationName || t.payee
                    : t.payer || 'Learner not recorded'}
                </h2>
                <p className="admin-record-meta">
                  {t.course || t.reference || 'Reference not recorded'}
                </p>
                <dl className="admin-record-info">
                  <div>
                    <dt>Amount</dt>
                    <dd>{money(t.amount, t.currency)}</dd>
                  </div>
                  <div>
                    <dt>Method</dt>
                    <dd>{t.method || 'Not recorded'}</dd>
                  </div>
                  {t.type === 'Payout' && (
                    <div>
                      <dt>Recorded by</dt>
                      <dd>{t.recordedByName || 'Administrator'}</dd>
                    </div>
                  )}
                </dl>
                <div className="admin-record-footer">
                  <span>{timestampLabel(t.date || t.createdAt)}</span>
                </div>
                <p className="admin-record-code mt-3">{t.reference || t.id}</p>
              </article>
            ))}
          </div>
          {!ledger.data?.items?.length && (
            <AdminEmpty
              title={
                type === 'Payment'
                  ? 'No learner payments found'
                  : 'No organization transfers recorded'
              }
            />
          )}
          <Pagination
            currentPage={page}
            totalPages={ledger.data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
