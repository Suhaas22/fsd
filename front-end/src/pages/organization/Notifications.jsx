import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Trash2
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, stats } = useOrg();
  const { addToast } = useToast();
  const [filter, setFilter] = useState('All');

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    return true;
  });

  const handleMarkAll = () => {
    markAllNotificationsRead();
    addToast('All notifications marked as read!', 'success');
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Notifications' }]}
      actions={
        stats.unreadNotifications > 0 && (
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Organization Notifications</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              System alerts, faculty recruitment updates, and student enrollment events.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['All', 'Unread', 'Read'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filter === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 divide-y divide-outline-variant/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-outline text-xs">
              No notifications in this filter category.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  addToast(`Read: ${n.title}`, 'info');
                }}
                className={`py-4 px-4 rounded-2xl flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                  n.read ? 'hover:bg-surface-container-low opacity-75' : 'bg-primary/5 hover:bg-primary/10 font-medium'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-outline-variant' : 'bg-primary'}`} />
                  <div>
                    <h3 className={`text-xs ${n.read ? 'font-semibold text-on-surface' : 'font-black text-on-surface'}`}>
                      {n.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{n.desc}</p>
                    <span className="text-[10px] text-outline mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {n.time}
                    </span>
                  </div>
                </div>
                {!n.read && (
                  <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold whitespace-nowrap">
                    New
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </OrgLayout>
  );
}
