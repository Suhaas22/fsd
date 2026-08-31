import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu,
  X,
  Search, 
  Bell, 
  User, 
  BookOpen, 
  Award, 
  TrendingUp, 
  FileQuestion, 
  CreditCard,
  CheckCircle2,
  Settings, 
  LogOut,
  ChevronRight,
  Flame,
  LayoutDashboard,
  ShieldCheck,
  Video
} from 'lucide-react';
import { userData } from '../../data/userData';
import { coursesData } from '../../data/coursesData';
import { useToast } from '../common/Toast';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Module 2 Quiz is ready to take!', desc: 'State Management in NexusPay', time: '10m ago', read: false },
    { id: 2, title: 'Certificate Issued: Advanced Payment Systems', desc: 'Verified on Oct 15, 2024', time: '2h ago', read: false },
    { id: 3, title: 'New Course Added: Applied Machine Learning', desc: 'Recommended based on your track', time: '1d ago', read: true }
  ]);

  const searchRef = useRef(null);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  const searchSuggestions = searchQuery.trim()
    ? coursesData.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const mainPages = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Explore Catalog', path: '/explore', icon: Search },
    { name: 'Course Details', path: '/course-details', icon: BookOpen },
    { name: 'My Learning LMS', path: '/my-learning', icon: BookOpen },
    { name: 'Course Progress', path: '/course-progress', icon: TrendingUp },
    { name: 'Video Player', path: '/player', icon: Video },
    { name: 'Graded Quiz', path: '/quiz', icon: FileQuestion },
    { name: 'Certificates', path: '/certificates', icon: Award },
    { name: 'Checkout', path: '/checkout', icon: CreditCard },
  ];

  const accountPages = [
    { name: 'Profile & Settings', path: '/profile', icon: User },
    { name: 'Billing & Payment Details', path: '/profile', icon: CreditCard },
    { name: 'Notification Preferences', path: '/profile', icon: Bell },
  ];

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname === path;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-surface/95 backdrop-blur-md border-b border-outline-variant/80 sticky top-0 z-40 shadow-ambient w-full">
        {/* Full screen edge-to-edge navbar */}
        <div className="flex justify-between items-center h-16 px-4 md:px-8 lg:px-12 w-full gap-4 lg:gap-8">
          
          {/* Left: 3-Lines (Hamburger) Menu Button & Logo & Links */}
          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            {/* 3-Lines Menu Icon Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl hover:bg-surface-container text-on-surface transition-colors flex items-center justify-center border border-outline-variant/60 shadow-xs"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-on-surface" />
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-primary tracking-tight leading-none">
                  NexusPay <span className="text-on-surface font-semibold">Learning</span>
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5 ml-3">
              <Link
                to="/explore"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Browse Catalog
              </Link>
              <Link
                to="/my-learning"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                My Learning
              </Link>
              <Link
                to="/certificates"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Certificates
              </Link>
            </nav>
          </div>

          {/* Center Search Input (Expansive & Flexible) */}
          <div ref={searchRef} className="flex-1 max-w-2xl mx-2 md:mx-6 relative">
            <form onSubmit={handleSearch} className="w-full relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search courses, skills, topics (e.g. AWS, Python, CAPM)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full h-10 pl-10 pr-9 text-xs md:text-sm bg-surface-container-low border border-outline-variant/80 rounded-full focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all text-on-surface font-medium placeholder:text-outline shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-outline hover:text-on-surface"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Search Dropdown */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant p-3 z-50 animate-in fade-in">
                <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-2 pb-1.5 border-b border-outline-variant/60 flex items-center justify-between">
                  <span>Matching Courses ({searchSuggestions.length})</span>
                  <span className="text-[10px] text-primary font-semibold">Press Enter to view all</span>
                </div>
                {searchSuggestions.length === 0 ? (
                  <p className="text-xs text-outline p-3 text-center">No exact match found.</p>
                ) : (
                  <div className="divide-y divide-outline-variant/40 pt-1">
                    {searchSuggestions.map((course) => (
                      <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        onClick={() => setShowSearchResults(false)}
                        className="p-2.5 rounded-xl hover:bg-surface-container-low flex items-center justify-between gap-3 group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={course.thumbnail} alt={course.title} className="w-10 h-8 rounded-lg object-cover" />
                          <div>
                            <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{course.title}</p>
                            <p className="text-[10px] text-outline">${course.price} • {course.institution}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Notifications, Profile */}
          <div className="flex items-center gap-3 flex-shrink-0">
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant p-3.5 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                    <span className="font-bold text-xs text-on-surface">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsAsRead} className="text-[11px] text-primary font-semibold hover:underline">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="py-2 divide-y divide-outline-variant/40">
                    {notifications.map((item) => (
                      <div key={item.id} className="py-2 flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${item.read ? 'bg-outline-variant' : 'bg-primary'}`} />
                        <div className="flex-1 text-[11px]">
                          <p className={item.read ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}>{item.title}</p>
                          <p className="text-[10px] text-outline">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 transition-all shadow-xs"
              >
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="hidden md:inline text-xs font-semibold text-on-surface">
                  {userData.name.split(' ')[0]}
                </span>
              </button>

              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-surface-container-lowest rounded-2xl shadow-elevation-3 border border-outline-variant p-2 z-50 animate-in fade-in"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="p-2.5 border-b border-outline-variant/60 flex items-center gap-2.5">
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-on-surface truncate">{userData.name}</p>
                      <p className="text-[10px] text-outline truncate">{userData.email}</p>
                    </div>
                  </div>

                  <div className="py-1 text-xs text-on-surface space-y-0.5">
                    <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                      <User className="w-3.5 h-3.5" />
                      <span>Profile & Settings</span>
                    </Link>
                    <Link to="/my-learning" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>My Learning</span>
                    </Link>
                    <Link to="/certificates" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificates</span>
                    </Link>
                    <Link to="/checkout" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Checkout</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-outline-variant/60">
                    <button
                      onClick={() => {
                        addToast('Logged out', 'info');
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error-container/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 3-Lines Sliding Sidebar / Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Sliding Panel */}
          <div className="relative w-80 max-w-[85vw] bg-surface-container-lowest border-r border-outline-variant shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-left duration-200">
            
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface leading-tight">NexusPay Academy</h3>
                  <p className="text-[10px] text-outline">Navigation & Account Menu</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-container text-on-surface transition-colors"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card inside Drawer */}
            <div className="p-4 border-b border-outline-variant/80 bg-surface-container-low/30">
              <div className="flex items-center gap-3">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-primary/20"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-on-surface truncate">{userData.name}</h4>
                  <p className="text-[11px] text-outline truncate">{userData.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                      <Flame className="w-3 h-3 text-amber-600 fill-current" />
                      {userData.streakDays}-Day Streak
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Main Pages */}
              <div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block px-2 mb-2">
                  All Application Pages
                </span>
                <div className="space-y-1">
                  {mainPages.map((item) => {
                    const Icon = item.icon;
                    const isCur = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isCur
                            ? 'bg-primary text-white font-bold shadow-xs'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account Settings */}
              <div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block px-2 mb-2">
                  Profile & Settings
                </span>
                <div className="space-y-1">
                  {accountPages.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 flex-shrink-0 text-outline" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-low/40">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  addToast('Signed out of demo session', 'info');
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-container hover:bg-error-container/30 text-error text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
