import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UserRound,
  Bell,
  LockKeyhole,
  Mail,
  Save,
  Building2,
} from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../services/api';
import { AdminHeader, AdminDataState } from '../admin/AdminUI';
import { InboxPanel } from './NotificationBell';
import { dateLabel } from '../../utils/adminDisplay';
export default function AccountPage() {
  const state = useRemoteData('/workspace/account');
  const [params, setParams] = useSearchParams();
  const tab = ['profile', 'settings', 'notifications'].includes(
    params.get('tab'),
  )
    ? params.get('tab')
    : 'profile';
  const [form, setForm] = useState({ name: '', phone: '', bio: '' });
  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const account = state.data;
  useEffect(() => {
    if (account)
      setForm({
        name: account.name || '',
        phone: account.phone || '',
        bio: account.bio || '',
      });
  }, [account]);
  function choose(value) {
    setParams({ tab: value });
    setMessage('');
    setError('');
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (tab === 'settings') {
        if (password.next !== password.confirm)
          throw new Error('The new passwords do not match.');
        await api.auth.changePassword(
          password.current,
          password.next,
          account.id,
        );
        setPassword({ current: '', next: '', confirm: '' });
        setMessage('Password updated.');
      } else {
        await api.patch('/workspace/account', form);
        state.refresh();
        window.dispatchEvent(new Event('account-changed'));
        setMessage('Profile saved.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-page account-page">
      <AdminHeader title="My account" />
      <AdminDataState {...state} />
      {account && !state.error && (
        <>
          <section className="account-identity-card">
            <span className="account-portrait">{account.name?.charAt(0)}</span>
            <div>
              <span className="account-role">
                {account.role === 'SuperAdmin' ? 'Super admin' : account.role}
              </span>
              <h2>{account.name}</h2>
              <p>
                <Mail size={14} />
                {account.email}
              </p>
              {account.organizationName && (
                <p>
                  <Building2 size={14} />
                  {account.organizationName}
                </p>
              )}
            </div>
            <div className="account-identity-date">
              <span>Member since</span>
              <strong>{dateLabel(account.createdAt)}</strong>
            </div>
          </section>
          <nav
            className="account-section-tabs"
            aria-label="Account sections"
          >
            {[
              ['profile', 'Profile', UserRound],
              ['settings', 'Settings', LockKeyhole],
              ['notifications', 'Notifications', Bell],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                aria-pressed={tab === key}
                onClick={() => choose(key)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          {tab === 'notifications' ? (
            <section className="admin-card account-inbox">
              <h2>Your inbox</h2>
              <InboxPanel />
            </section>
          ) : (
            <div className="account-columns">
              <form
                className="admin-card learner-form account-form"
                onSubmit={save}
              >
                <div className="account-section-heading">
                  <span className="admin-icon-tile admin-icon-green">
                    {tab === 'profile' ? (
                      <UserRound size={20} />
                    ) : (
                      <LockKeyhole size={20} />
                    )}
                  </span>
                  <div>
                    <h2>
                      {tab === 'profile'
                        ? 'Personal details'
                        : 'Change password'}
                    </h2>
                    <p>
                      {tab === 'profile'
                        ? 'Keep your account information up to date.'
                        : 'Update the password you use to sign in.'}
                    </p>
                  </div>
                </div>
                {tab === 'profile' && form ? (
                  <>
                    <div className="learner-field-grid">
                      <label>
                        Full name
                        <input
                          required
                          minLength={2}
                          maxLength={160}
                          className="admin-input"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Email address
                        <input
                          className="admin-input"
                          value={account.email}
                          readOnly
                        />
                        <small>Your sign-in email</small>
                      </label>
                      <label>
                        Phone
                        <input
                          className="admin-input"
                          type="tel"
                          maxLength={30}
                          value={form.phone}
                          placeholder="Optional"
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <label>
                      About
                      <textarea
                        className="admin-input"
                        rows={5}
                        maxLength={1000}
                        value={form.bio}
                        placeholder="Optional"
                        onChange={(e) =>
                          setForm({ ...form, bio: e.target.value })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <>
                    {[
                      ['current', 'Current password'],
                      ['next', 'New password'],
                      ['confirm', 'Confirm new password'],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          required
                          type="password"
                          minLength={6}
                          autoComplete={
                            key === 'current'
                              ? 'current-password'
                              : 'new-password'
                          }
                          className="admin-input"
                          value={password[key]}
                          onChange={(e) =>
                            setPassword({ ...password, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <p className="admin-muted">
                      Use six or more characters with uppercase and lowercase
                      letters, a number and a symbol.
                    </p>
                  </>
                )}
                {error && (
                  <p
                    className="workspace-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                {message && (
                  <p
                    className="admin-success"
                    role="status"
                  >
                    {message}
                  </p>
                )}
                <div className="learner-form-footer">
                  <button
                    disabled={busy || !form}
                    className="admin-button admin-button-primary"
                  >
                    <Save size={15} />
                    {busy
                      ? 'Saving…'
                      : tab === 'profile'
                        ? 'Save profile'
                        : 'Update password'}
                  </button>
                </div>
              </form>
              <aside className="account-side-cards">
                <section className="admin-card">
                  <span className="admin-icon-tile admin-icon-green">
                    <Bell size={20} />
                  </span>
                  <h2>Notifications</h2>
                  <p>
                    Course updates, invitations and account activity are
                    together in your inbox.
                  </p>
                  <button
                    className="admin-button"
                    onClick={() => choose('notifications')}
                  >
                    Open inbox
                  </button>
                </section>
                <section className="admin-card">
                  <span className="admin-icon-tile admin-icon-green">
                    <UserRound size={20} />
                  </span>
                  <h2>Your workspace</h2>
                  <dl className="finance-breakdown">
                    <div>
                      <dt>Account</dt>
                      <dd>
                        {account.role === 'SuperAdmin'
                          ? 'Super admin'
                          : account.role}
                      </dd>
                    </div>
                    {account.organizationName && (
                      <div>
                        <dt>Institute</dt>
                        <dd>{account.organizationName}</dd>
                      </div>
                    )}
                  </dl>
                  <button
                    className="admin-button"
                    onClick={() =>
                      choose(tab === 'profile' ? 'settings' : 'profile')
                    }
                  >
                    {tab === 'profile' ? 'Account settings' : 'Edit profile'}
                  </button>
                </section>
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
}
