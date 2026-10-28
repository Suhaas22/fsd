import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings } from 'lucide-react';
import NotificationBell from '../workspace/NotificationBell';
import { useRemoteData } from '../../hooks/useRemoteData';
export default function OrgTopNav({ breadcrumbs = [], actions }) {
  const session = useRemoteData('/workspace/session');
  return (
    <header className="workspace-topbar">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm"
      >
        <Link to="/org/dashboard">Organization</Link>
        {breadcrumbs.map((c, i) => (
          <React.Fragment key={i}>
            <ChevronRight size={14} />
            {c.path ? (
              <Link to={c.path}>{c.label}</Link>
            ) : (
              <span>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        {actions}
        <NotificationBell />
        <Link
          to="/org/profile?tab=settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </Link>
        <Link
          className="workspace-profile-link"
          to="/org/profile"
          aria-label="Open organization profile"
        >
          <span className="workspace-avatar">
            {session.data?.name?.charAt(0) || '·'}
          </span>
          <span className="hidden sm:block">
            <strong>{session.data?.name || 'Loading…'}</strong>
            <small>{session.data?.email || ''}</small>
          </span>
        </Link>
      </div>
    </header>
  );
}
