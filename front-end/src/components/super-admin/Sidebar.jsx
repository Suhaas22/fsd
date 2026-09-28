import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Building2,
  GraduationCap,
  Settings,
  LogOut,
  ArrowLeft,
  Activity,
  Shield,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import HumanAvatar from '../common/HumanAvatar';

const navGroups = [
  {
    group: 'Platform',
    items: [
      { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
      { name: 'Organizations', path: '/super-admin/organizations', icon: Building2 },
      { name: 'Learners', path: '/super-admin/learners', icon: GraduationCap },
    ],
  },
  {
    group: 'Finance',
    items: [
      { name: 'Payments & Revenue', path: '/super-admin/payments', icon: CreditCard },
    ],
  },
  {
    group: 'Governance',
    items: [
      { name: 'Admin History', path: '/super-admin/admins', icon: ShieldCheck },
      { name: 'Settings', path: '/super-admin/settings', icon: Settings },
    ],
  },
];

export const SuperAdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('nexuspay_student_token');
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-[#0F172A] text-white border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shrink-0 flex flex-col justify-between shadow-2xl select-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Brand / Header with Coursera Blue */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <NavLink to="/super-admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-[#0056D2] flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-white leading-none">
                  NexusPay <span className="text-[#388BFD] font-semibold text-xs block mt-0.5">Super Admin</span>
                </h2>
              </div>
            </NavLink>
          </div>

          {/* Grouped Nav Items */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-170px)] custom-scrollbar">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (isOpen) toggleSidebar();
                      }}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                          isActive
                            ? 'bg-[#0056D2] text-white shadow-md shadow-[#0056D2]/30 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={clsx(
                                'text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider',
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-950 text-blue-300 border border-blue-700/50'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Super Admin User Dock & Controls with Ethical Human Avatar */}
        <div className="p-3 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border border-slate-800/90 shadow-lg text-[11px] space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <HumanAvatar name="Super Admin" size="sm" className="ring-2 ring-[#0056D2]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs truncate">Super Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Platform Governance</p>
            </div>
          </div>

          {/* Quick Action Button Strip (Settings & Logout) */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
            <NavLink
              to="/super-admin/settings"
              onClick={() => {
                if (isOpen) toggleSidebar();
              }}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                )
              }
              title="Platform Settings & Policies"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span>Settings</span>
            </NavLink>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-slate-800/80 text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 border border-transparent hover:border-rose-800/50 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Sign Out of Super Admin?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your Super Admin session will be closed safely. You can log back in at any time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminSidebar;
