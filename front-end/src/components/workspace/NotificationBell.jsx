import { timestampLabel } from '../../utils/adminDisplay';
import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, X, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { useRemoteData } from '../../hooks/useRemoteData';
export function useInbox() {
  const state = useRemoteData('/workspace/notifications');
  useEffect(() => {
    const refresh = () => state.refresh();
    const tick = setInterval(refresh, 30000);
    window.addEventListener('notifications-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(tick);
      window.removeEventListener('notifications-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [state.refresh]);
  return state;
}
export function InboxPanel({ compact = false, state: provided }) {
  const own = useInbox();
  const state = provided || own;
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(false);
  async function run(path, method = 'patch') {
    setBusy(path);
    setError('');
    try {
      await api[method](path, {});
      state.refresh();
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }
  const items = (state.data?.items || []).filter((n) => !unread || !n.read);
  return (
    <section className={`workspace-inbox ${compact ? 'is-compact' : ''}`}>
      <div className="workspace-inbox-actions">
        <span>{state.data?.unreadCount ?? '—'} unread</span>
        <button
          disabled={!!busy || !state.data?.unreadCount}
          onClick={() => run('/workspace/notifications/read-all')}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
        <button onClick={state.refresh} aria-label="Refresh notifications">
          <RefreshCw size={14} />
        </button>
      </div>
      <label className="workspace-unread-filter">
        <input
          type="checkbox"
          checked={unread}
          onChange={(e) => setUnread(e.target.checked)}
        />
        Unread only
      </label>
      {(error || state.error) && (
        <p role="alert" className="workspace-error">
          {error || state.error}
          <button onClick={state.refresh}>Retry</button>
        </p>
      )}
      {state.loading && !state.data ? (
        <p className="workspace-inbox-empty">Loading notifications…</p>
      ) : (
        <div className="workspace-inbox-list">
          {items.map((n) => (
            <article key={n.id} className={n.read ? 'is-read' : 'is-unread'}>
              <div className="flex justify-between gap-3">
                <h3>{n.title}</h3>
                <button
                  disabled={!!busy}
                  aria-label={`Dismiss ${n.title}`}
                  onClick={() =>
                    run(`/workspace/notifications/${n.id}`, 'delete')
                  }
                >
                  <X size={14} />
                </button>
              </div>
              <p>{n.desc || n.message || ''}</p>
              {n.actionUrl && (
                <Link className="workspace-notification-link" to={n.actionUrl}>
                  {n.actionLabel || 'View details'} →
                </Link>
              )}
              <div className="workspace-inbox-meta">
                <time>
                  {n.createdAt
                    ? timestampLabel(n.createdAt)
                    : 'Date not recorded'}
                </time>
                {!n.read && (
                  <button
                    disabled={!!busy}
                    onClick={() => run(`/workspace/notifications/${n.id}/read`)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {!state.loading && !state.error && !items.length && (
        <div className="workspace-inbox-empty">
          <Bell size={23} />
          <strong>{unread ? 'All caught up' : 'No notifications yet'}</strong>
        </div>
      )}
    </section>
  );
}
export default function NotificationBell({ href }) {
  const location = useLocation();
  const prefix = location.pathname.startsWith('/organization')
    ? '/org'
    : '/' + location.pathname.split('/')[1];
  const accountPath = ['/admin', '/super-admin'].includes(prefix)
    ? prefix + '/settings'
    : prefix + '/profile';
  const state = useInbox();
  return (
    <Link
      to={href || accountPath + '?tab=notifications'}
      className="workspace-bell"
      aria-label={`Notifications${state.data?.unreadCount ? `, ${state.data.unreadCount} unread` : ''}`}
    >
      <Bell size={19} />
      {!!state.data?.unreadCount && <span>{state.data.unreadCount}</span>}
    </Link>
  );
}
