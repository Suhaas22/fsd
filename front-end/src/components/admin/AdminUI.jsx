import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Inbox,
  Search,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
export function AdminHeader({
  title,
  description,
  eyebrow = 'Workspace',
  children,
}) {
  return (
    <header className="admin-page-header">
      <h1 className="admin-heading">{title}</h1>
      {children && <div className="admin-header-actions">{children}</div>}
    </header>
  );
}
export function AdminMetric({
  label,
  value,
  icon: Icon,
  detail,
  to,
  accent = 'green',
}) {
  const content = (
    <>
      <div className="admin-metric-top">
        <span className={`admin-icon-tile admin-icon-${accent}`}>
          {Icon && <Icon size={20} strokeWidth={1.7} />}
        </span>
        {to && <ArrowUpRight size={16} />}
      </div>
      <div className="admin-metric-value">{value}</div>
      <h2 className="admin-metric-label">{label}</h2>
      {detail && <p className="admin-metric-detail">{detail}</p>}
    </>
  );
  return to ? (
    <Link to={to} className="admin-card admin-metric admin-card-link">
      {content}
    </Link>
  ) : (
    <article className="admin-card admin-metric">{content}</article>
  );
}
export function AdminEmpty({
  title = 'Nothing here yet',
  description = 'Records will appear here when available.',
  icon: Icon = Inbox,
}) {
  return (
    <div className="admin-card admin-empty">
      <span className="admin-empty-icon">
        <Icon size={27} strokeWidth={1.4} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
export function AdminSearch({
  value,
  onChange,
  placeholder = 'Search records…',
  label = 'Search records',
}) {
  return (
    <label className="admin-search">
      <Search size={18} />
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function AdminSectionHeader({ title, description, children }) {
  return (
    <div className="admin-section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function AdminDataState({ loading, error, refresh }) {
  if (loading)
    return (
      <div
        className="admin-skeleton-grid"
        role="status"
        aria-label="Loading records"
      >
        {[0, 1, 2].map((n) => (
          <div className="admin-card admin-skeleton" key={n}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  if (error)
    return (
      <div className="admin-card admin-error-state" role="alert">
        <span className="admin-icon-tile admin-icon-rose">
          <AlertCircle size={22} />
        </span>
        <div>
          <h2>We couldn’t load these records</h2>
          <p>
            {/fetch|network/i.test(error)
              ? 'The server is unavailable. Please try again shortly.'
              : error}
          </p>
        </div>
        {refresh && (
          <button className="admin-button" onClick={refresh}>
            <RefreshCw size={14} /> Try again
          </button>
        )}
      </div>
    );
  return null;
}
