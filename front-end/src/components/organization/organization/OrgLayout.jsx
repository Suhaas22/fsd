import React from 'react';
import OrgSidebar from './OrgSidebar';
import OrgTopNav from './OrgTopNav';

export default function OrgLayout({ children, breadcrumbs = [], actions, className = "" }) {
  return (
    <div className="min-h-screen flex bg-[#fcf9f8] text-[#1b1b1c] font-sans antialiased">
      {/* 260px Left Dark Navy Sidebar */}
      <OrgSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <OrgTopNav breadcrumbs={breadcrumbs} actions={actions} />
        <main className={`flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto space-y-8 ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
