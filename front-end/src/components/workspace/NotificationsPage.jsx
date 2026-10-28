import React from 'react';
import { InboxPanel } from './NotificationBell';
export default function NotificationsPage() {
  return (
    <div className="workspace-page">
      <h1>Notifications</h1>
      <div className="workspace-surface">
        <InboxPanel />
      </div>
    </div>
  );
}
