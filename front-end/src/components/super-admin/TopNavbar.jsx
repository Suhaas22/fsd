import React from 'react';
import { Menu, ShieldCheck, Activity, Settings, ExternalLink, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SuperAdminTopNavbar = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Super Admin Portal</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Platform Active</span>
            <span className="text-[10px] font-bold text-emerald-800">• 85/15 Rule</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Settings Shortcut */}
        <Link
          to="/super-admin/settings"
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-colors border border-slate-200/80"
          title="Super Admin Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Super Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
            alt="Super Admin Avatar"
            className="w-8 h-8 rounded-full border-2 border-indigo-500 shadow-xs object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Super Admin</p>
            <p className="text-[10px] text-indigo-600 font-medium leading-none mt-0.5">superadmin@nexuspay.io</p>
          </div>
        </div>
      </div>
    </header>
  );
};
export default SuperAdminTopNavbar;
