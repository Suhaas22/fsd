import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  ChevronDown,
  Home,
  Crown
} from 'lucide-react';

export default function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const currentRole = location.pathname.startsWith('/super-admin')
    ? { name: '1. Super Admin', icon: Crown, color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' }
    : location.pathname.startsWith('/admin')
    ? { name: '2. Admin', icon: ShieldCheck, color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' }
    : location.pathname.startsWith('/org') || location.pathname.startsWith('/organization')
    ? { name: '3. Organization', icon: Building2, color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20' }
    : location.pathname.startsWith('/instructor')
    ? { name: '4. Instructor', icon: Users, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' }
    : location.pathname.startsWith('/student')
    ? { name: '5. Student', icon: GraduationCap, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' }
    : { name: 'Hub', icon: Home, color: 'text-slate-400 bg-slate-800 border-slate-700' };

  const CurrentIcon = currentRole.icon;

  const roles = [
    { name: '1. Super Admin Portal', path: '/super-admin', icon: Crown, color: 'text-purple-600' },
    { name: '2. Admin Portal', path: '/admin', icon: ShieldCheck, color: 'text-blue-600' },
    { name: '3. Organization Portal', path: '/org', icon: Building2, color: 'text-indigo-600' },
    { name: '4. Instructor Portal', path: '/instructor', icon: Users, color: 'text-emerald-600' },
    { name: '5. Student Portal', path: '/student', icon: GraduationCap, color: 'text-amber-600' },
    { name: 'Central Landing', path: '/', icon: Home, color: 'text-slate-400' },
  ];

  return (
    <div className="relative inline-block text-left z-50">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${currentRole.color}`}
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        <span>{currentRole.name} Mode</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-slate-800">
            <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              5-Portal Hierarchy Switcher
            </div>
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <Link
                  key={i}
                  to={r.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${r.color}`} />
                  <span>{r.name}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
