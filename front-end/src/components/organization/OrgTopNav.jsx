import NotificationBell from '../workspace/NotificationBell';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  Building2,
  Check,
  X,
  LogOut
} from 'lucide-react';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../common/Toast';

export default function OrgTopNav({ breadcrumbs = [], actions }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { notifications, markNotificationRead, markAllNotificationsRead, stats, info } = useOrg();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    // Clear all session keys
    [
      'auth_token', 'nexuspay_auth_token', 'user_id',
      'nexuspay_active_role', 'user_role', 'user_name', 'user_email'
    ].forEach(key => localStorage.removeItem(key));
    navigate('/signin', { replace: true });
  };

  const unreadList = notifications.filter(n => !n.read);

  return (
    <header className="bg-surface/95 backdrop-blur-md border-b border-outline-variant/60 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between shadow-ambient">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-outline">
        <Link to="/org/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold text-on-surface">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>Organization</span>
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-outline-variant" />
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-primary font-bold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions & Notifications */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Notifications Popover */}
        <div className="relative">
          <NotificationBell/>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[28rem] max-w-[calc(100vw-1.5rem)] bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant p-5 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <span className="font-bold text-xs text-on-surface">
                  Notifications ({stats.unreadNotifications} unread)
                </span>
                <button
                  onClick={() => {
                    markAllNotificationsRead();
                    addToast('All notifications marked as read', 'info');
                  }}
                  disabled={stats.unreadNotifications === 0}
                  className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark all read
                </button>
              </div>

              <div className="py-2 divide-y divide-outline-variant/40 max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${n.read ? 'hover:bg-surface-container-low' : 'bg-primary/5 hover:bg-primary/10'}`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-outline-variant' : 'bg-primary'}`} />
                    <div className="flex-1 text-[11px]">
                      <p className={`leading-snug ${n.read ? 'text-on-surface font-semibold' : 'text-on-surface font-black'}`}>{n.title}</p>
                      <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">{n.desc}</p>
                      <p className="text-[9px] text-outline mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden">
                <Link
                  to="/org/dashboard"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-primary hover:underline block py-1"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          title="Log out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>

      </div>

    </header>
  );
}
