import { WorkspaceSidebar } from '../workspace/WorkspaceSidebar';
import NotificationBell from '../workspace/NotificationBell';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Menu,
  X,
  BookOpen,
  Award,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Compass,
  Star,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import HumanAvatar from '../common/HumanAvatar';
import { useStudent } from '../../context/StudentContext';

const studentNavItems = [
  {
    name: 'Dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
    match: ['/student', '/student/dashboard'],
  },
  {
    name: 'Browse Courses',
    href: '/student/explore',
    icon: Compass,
    match: ['/student/explore', '/student/course/'],
  },
  {
    name: 'My Learning',
    href: '/student/my-learning',
    icon: BookOpen,
    match: ['/student/my-learning', '/student/learn/'],
  },
  {
    name: 'Certificates',
    href: '/student/certificates',
    icon: Award,
    match: ['/student/certificates'],
  },
  {
    name: 'My Reviews',
    href: '/student/reviews',
    icon: Star,
    match: ['/student/reviews'],
  },
  {
    name: 'Disputes',
    href: '/student/disputes',
    icon: ShieldAlert,
    match: ['/student/disputes'],
  },
  {
    name: 'Billing',
    href: '/student/billing',
    icon: CreditCard,
    match: [
      '/student/billing',
      '/student/checkout',
      '/student/payment-success',
    ],
  },
  {
    name: 'Profile',
    href: '/student/profile',
    icon: User,
    match: ['/student/profile'],
  },
];

function isItemActive(item, pathname) {
  return item.match.some((m) =>
    m.endsWith('/') ? pathname.startsWith(m) : pathname === m
  );
}

export function signOutStudent(navigate) {
  [
    'auth_token',
    'nexuspay_auth_token',
    'nexuspay_student_token',
    'user_id',
    'nexuspay_user_id',
    'user_role',
    'nexuspay_active_role',
    'user_name',
    'user_email',
  ].forEach((k) => localStorage.removeItem(k));
  navigate('/signin?role=Student');
}

export function StudentSidebar({ isOpen, onClose }) {
  return <WorkspaceSidebar role="Student" isOpen={isOpen} onClose={onClose} />;
}

export default function StudentTopbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useStudent();
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    api.student
      .getCatalog()
      .then((c) => setCatalog(Array.isArray(c) ? c : []))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    setShowResults(false);
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((c) =>
        [
          c.title,
          c.category,
          c.instructorName,
          c.leadInstructorName,
          c.organizationName,
        ].some((v) => v?.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [catalog, query]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(
      q ? `/student/explore?q=${encodeURIComponent(q)}` : '/student/explore'
    );
    setShowResults(false);
  };

  const name = student?.name || '';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="h-16 px-4 md:px-8 flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div ref={searchRef} className="flex-1 max-w-xl relative">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoComplete="off"
              placeholder="Search courses, topics or instructors"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full h-10 pl-10 pr-9 text-sm bg-slate-100/90 border border-slate-200 rounded-full focus:outline-none focus:border-[#0056D2] focus:bg-white focus:ring-2 focus:ring-[#0056D2]/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {showResults && query.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              {results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {results.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => navigate(`/student/course/${c.id}`)}
                      className="w-full p-3 hover:bg-blue-50/70 flex items-center gap-3 text-left"
                    >
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt=""
                          className="w-12 h-10 rounded-lg object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-slate-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {[
                            c.category,
                            c.leadInstructorName || c.instructorName,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-center text-xs text-slate-500">
                  No courses match "{query}"
                </p>
              )}
            </div>
          )}
        </div>

        <NotificationBell href="/student/profile?tab=notifications" />
        <div ref={menuRef} className="relative ml-auto">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 border border-slate-200"
          >
            <HumanAvatar name={name || 'Learner'} size="xs" />
            <span className="hidden md:inline text-xs font-semibold text-slate-800">
              {name.split(' ')[0]}
            </span>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-sm">
              <Link
                to="/student/profile"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
              >
                <User className="w-4 h-4 text-slate-500" /> Profile
              </Link>
              <Link
                to="/student/reviews"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
              >
                <Star className="w-4 h-4 text-slate-500" /> My Reviews
              </Link>
              <Link
                to="/student/disputes"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
              >
                <ShieldAlert className="w-4 h-4 text-slate-500" /> Disputes
              </Link>
              <Link
                to="/student/billing"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
              >
                <CreditCard className="w-4 h-4 text-slate-500" /> Billing
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false);
                  signOutStudent(navigate);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium text-left"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
