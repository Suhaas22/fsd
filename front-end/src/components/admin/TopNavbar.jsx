import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { UserAvatar } from './UserAvatar';

export const TopNavbar = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(
        `/admin/courses?search=${encodeURIComponent(searchTerm.trim())}`
      );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:block">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden sm:block"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses, users..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all"
          />
        </form>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 lg:pl-6">
          <UserAvatar
            name="Admin User"
            role="Super Admin"
          />
        </div>
      </div>
    </header>
  );
};
