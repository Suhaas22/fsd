import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { SuperAdminSidebar } from './Sidebar';
import { SuperAdminTopNavbar } from './TopNavbar';

export const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="academy-portal min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LEFT SIDEBAR (Student & Coursera Design System)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN COLUMN (Top Header + Viewport + Academic Footer)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminTopNavbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 py-8">
          <Outlet />
        </main>

        <footer className="admin-footer">
          <span>Acadex / Platform administration</span>
          <Link to="/super-admin/settings">Settings</Link>
        </footer>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
