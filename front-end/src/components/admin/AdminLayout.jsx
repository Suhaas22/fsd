import NotificationBell from '../workspace/NotificationBell';
import React, { Component, useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  ChevronRight,
  UserRound,
  Settings,
  LogOut,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import {
  AdminSessionProvider,
  useAdminSession,
} from '../../context/AdminSession';
import '../../styles/admin-panels.css';
class AdminBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error('Admin page render error:', error);
  }
  render() {
    return this.state.failed ? (
      <div
        className="admin-card admin-empty"
        role="alert"
      >
        <h2>This page couldn’t be displayed</h2>
        <p>Please reload the page to try again.</p>
        <button
          className="admin-button"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
const titles = {
  dashboard: 'Overview',
  users: 'User directory',
  courses: 'Course library',
  payments: 'Payments',
  transactions: 'Transactions',
  disputes: 'Disputes',
  certificates: 'Certificates',
  settings: 'Settings & notifications',
  profile: 'My profile',
};
function AdminShell() {
  const session = useAdminSession();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef(null);
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenu(false);
    };
    const esc = (e) => {
      if (e.key === 'Escape') {
        setMenu(false);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, []);
  function logout() {
    [
      'nexuspay_auth_token',
      'auth_token',
      'nexuspay_active_role',
      'user_role',
    ].forEach((k) => localStorage.removeItem(k));
    navigate('/signin?role=Admin');
  }
  const title = location.pathname.endsWith('/approval')
    ? 'Course approvals'
    : titles[location.pathname.split('/')[2]] || 'Workspace';
  return (
    <div className="admin-workspace">
      <Sidebar
        isOpen={open}
        toggleSidebar={() => setOpen((v) => !v)}
      />
      <div className="admin-main-column">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              className="admin-icon-button admin-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>{title}</strong>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <NotificationBell />
            <span className="admin-topbar-divider" />
            <div
              className="relative"
              ref={ref}
            >
              <button
                className="admin-profile-trigger"
                aria-expanded={menu}
                aria-label="Account menu"
                onClick={() => setMenu((v) => !v)}
              >
                <span className="admin-avatar">
                  {session.profile?.name?.charAt(0) || <UserRound size={17} />}
                </span>
                <span className="admin-profile-label">
                  <strong>
                    {session.profile?.name ||
                      (session.loading
                        ? 'Loading account…'
                        : 'Admin workspace')}
                  </strong>
                  <small>{session.profile?.role || 'Administration'}</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div className="admin-profile-menu">
                  <p>
                    {session.profile?.email || 'Account details unavailable'}
                  </p>
                  <Link to="/admin/profile">
                    <UserRound size={16} />
                    My profile
                  </Link>
                  <Link to="/admin/settings">
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button onClick={logout}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="admin-content">
          {session.error && (
            <div
              className="admin-alert admin-session-alert"
              role="alert"
            >
              <span>Account details are unavailable.</span>
              <button onClick={session.refresh}>Retry account</button>
            </div>
          )}
          <AdminBoundary key={location.pathname}>
            <Outlet />
          </AdminBoundary>
        </main>
        <footer className="admin-footer">
          <span>
            Acadex <span>/</span> Administration
          </span>
          <Link to="/admin/settings">Settings & notifications</Link>
        </footer>
      </div>
    </div>
  );
}
export const AdminLayout = () => (
  <AdminSessionProvider>
    <AdminShell />
  </AdminSessionProvider>
);
export default AdminLayout;
