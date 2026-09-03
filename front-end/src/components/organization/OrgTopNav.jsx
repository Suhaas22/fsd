import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronRight,
  ShieldCheck,
  Building2,
  Check,
  X
} from 'lucide-react';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../common/Toast';

export default function OrgTopNav({ breadcrumbs = [], actions }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { notifications, markNotificationRead, markAllNotificationsRead, stats, info } = useOrg();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadList = notifications.filter(n => !n.read);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/org/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

      {/* Center Search Input */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 text-outline absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search courses, instructors, learners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant/80 rounded-full focus:outline-none focus:border-primary focus:bg-white text-on-surface font-medium transition-all shadow-xs"
        />
      </form>

      {/* Right: Actions & Notifications */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative border border-outline-variant/40"
            title="Organization Alerts"
          >
            <Bell className="w-4 h-4" />
            {stats.unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <span className="font-bold text-xs text-on-surface">
                  Notifications ({stats.unreadNotifications} unread)
                </span>
                {stats.unreadNotifications > 0 && (
                  <button
                    onClick={() => {
                      markAllNotificationsRead();
                      addToast('All notifications marked as read', 'info');
                    }}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="py-2 divide-y divide-outline-variant/40 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
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

              <div className="pt-2 border-t border-outline-variant text-center">
                <Link
                  to="/org/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-primary hover:underline block py-1"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Institution</span>
        </div>

      </div>

    </header>
  );
}
