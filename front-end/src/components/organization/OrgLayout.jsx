import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import OrgSidebar from './OrgSidebar';
import OrgTopNav from './OrgTopNav';

export default function OrgLayout({
  children,
  breadcrumbs = [],
  actions,
  className = '',
}) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  return (
    <div className="academy-portal org-workspace min-h-screen flex bg-[#fcf9f8] text-[#1b1b1c] font-sans antialiased">
      {/* 260px Left Dark Navy Sidebar */}
      <OrgSidebar
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <button
          className="org-open-navigation"
          onClick={() => setNavigationOpen(true)}
          aria-label="Open organization navigation"
        >
          <Menu size={18} /> Organization menu
        </button>
        <OrgTopNav
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
        <main
          className={`flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto space-y-8 ${className}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
