import React, { useState, useEffect } from 'react';
import { Bell, Plus } from 'lucide-react';
import { api } from '../../utils/api';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications', 'admin')
      .then(data => { setNotifications(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Error fetching notifications:', err); setNotifications([]); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500">Send platform announcements and view alerts.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium">
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">System Notifications</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading notifications...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 flex gap-4 ${!notif.read ? 'bg-primary/5' : ''}`}>
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-semibold text-slate-800">{notif.title}</h4>
                    <span className="text-xs text-slate-500">{new Date(notif.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
