import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Bell, 
  Menu, 
  X, 
  BookOpen, 
  Award, 
  CreditCard, 
  FileQuestion, 
  TrendingUp,
  LayoutDashboard,
  Settings, 
  LogOut,
  ChevronRight,
  Flame,
  Building2,
  ShieldCheck,
  Clock3,
  PlusCircle,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import api from '../../../services/api';
import { useToast } from '../../common/Toast';
import RoleSwitcher from '../../common/RoleSwitcher';

const defaultUser = {
  name: "Alex Chen",
  email: "alex.chen@stanford.edu",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  streakDays: 14,
  orgMembershipStatus: "Independent Learner",
  university: "Independent Learner",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState(defaultUser);
  const [coursesData, setCoursesData] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submittingOrg, setSubmittingOrg] = useState(false);

  const searchRef = useRef(null);

  const fetchUserData = () => {
    api.student.getProfile('lrn-1')
      .then((p) => { if (p) setUserData({ ...defaultUser, ...p }); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUserData();
    api.courses.list()
      .then((c) => { setCoursesData(Array.isArray(c) ? c : (c?.items || [])); })
      .catch(() => {});
    api.student.getOrganizations()
      .then((o) => { setOrgsList(Array.isArray(o) ? o : []); })
      .catch(() => {});
  }, []);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scroll when mobile drawer is open
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/explore?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleRequestJoinOrg = async () => {
    if (!selectedOrg) return;
    try {
      setSubmittingOrg(true);
      await api.student.joinOrganization(selectedOrg.id, selectedOrg.name, 'lrn-1');
      addToast(`Join request submitted to ${selectedOrg.name}!`, 'success');
      setShowOrgModal(false);
      fetchUserData();
    } catch (err) {
      addToast('Failed to submit request: ' + err.message, 'error');
    } finally {
      setSubmittingOrg(false);
    }
  };

  const learningPages = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Explore Course Catalog', path: '/student/explore', icon: Search },
    { name: 'My Courses & Enrolled Tracks', path: '/student/my-learning', icon: BookOpen },
    { name: 'Course Milestones & Progress', path: '/student/course-progress', icon: TrendingUp },
    { name: 'Verified Certificates', path: '/student/certificates', icon: Award },
  ];

  const accountPages = [
    { name: 'Academic Profile & Settings', path: '/student/profile', icon: User },
    { name: 'Billing & Payment Details', path: '/student/profile', icon: CreditCard },
  ];

  const isActive = (path) => {
    if (path === '/student' && (location.pathname === '/student' || location.pathname === '/student/dashboard')) return true;
    return location.pathname === path;
  };

  const membershipStatus = userData.orgMembershipStatus || (userData.university && userData.university !== 'Independent Learner' ? 'Verified Student' : 'Independent Learner');
  const orgName = userData.requestedOrgName || userData.university || 'Stanford University';

  return (
    <>
      <header className="bg-surface/95 backdrop-blur-md border-b border-outline-variant/80 sticky top-0 z-40 shadow-ambient w-full">
        <div className="flex justify-between items-center h-16 px-4 md:px-8 lg:px-12 w-full gap-4 lg:gap-8">
          
          {/* Left: Hamburger & Brand Logo */}
          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl hover:bg-surface-container text-on-surface transition-colors flex items-center justify-center border border-outline-variant/60 shadow-xs"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-on-surface" />
            </button>

            <Link to="/student" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-primary tracking-tight leading-none">
                  NexusPay <span className="text-on-surface font-semibold">Learner LMS</span>
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1.5 ml-3">
              <Link
                to="/student/explore"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Catalog
              </Link>
              <Link
                to="/student/my-learning"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                My Courses
              </Link>
              <Link
                to="/student/certificates"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                Certificates
              </Link>
            </nav>
          </div>

          {/* Center Search Input */}
          <div ref={searchRef} className="flex-1 max-w-xl mx-2 md:mx-6 relative">
            <form onSubmit={handleSearch} className="w-full relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search courses, skills, topics (e.g. AWS, Microservices, Python)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full h-10 pl-10 pr-9 text-xs md:text-sm bg-surface-container-low border border-outline-variant/80 rounded-full focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all text-on-surface font-medium placeholder:text-outline shadow-xs"
              />
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <RoleSwitcher />

            {/* Profile Avatar */}
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
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="p-2.5 border-b border-slate-100 flex items-center gap-2.5">
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{userData.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{userData.email}</p>
                    </div>
                  </div>

                  <div className="py-1 text-xs text-slate-700 space-y-0.5">
                    <Link to="/student/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      <User className="w-3.5 h-3.5" />
                      <span>Profile & Settings</span>
                    </Link>
                    <Link to="/student/my-learning" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>My Enrolled Courses</span>
                    </Link>
                    <Link to="/student/certificates" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificates</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        addToast('Logged out', 'info');
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
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

      {/* SAAS STYLE SIDEBAR DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Sliding Sidebar Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-left duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">NexusPay Learning</h3>
                  <p className="text-[10px] text-slate-500">Coursera-Style EdTech SaaS</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Summary */}
            <div className="p-4 border-b border-slate-100 bg-indigo-50/40">
              <div className="flex items-center gap-3">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{userData.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{userData.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                      <Flame className="w-3 h-3 text-amber-600 fill-current" />
                      {userData.streakDays || 14}-Day Streak
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SaaS Sidebar Categories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* 1. LEARNING LMS */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                  Learning Hub
                </span>
                <div className="space-y-1">
                  {learningPages.map((item) => {
                    const Icon = item.icon;
                    const isCur = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isCur
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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

              {/* 2. DYNAMIC ORGANIZATION ITEM */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                  Institution & Organization
                </span>

                {membershipStatus === 'Verified Student' ? (
                  <div
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setShowOrgModal(true);
                    }}
                    className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100/60 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-emerald-900 truncate">My Organization</h4>
                        <p className="text-[10px] text-emerald-700 truncate font-semibold">{orgName}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-extrabold">Verified</span>
                  </div>
                ) : membershipStatus === 'Pending Organization Approval' ? (
                  <div
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setShowOrgModal(true);
                    }}
                    className="p-3 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Clock3 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-amber-900 truncate">Pending Approval</h4>
                        <p className="text-[10px] text-amber-700 truncate">{orgName}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-extrabold">Pending</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setShowOrgModal(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-900">Join Organization</h4>
                        <p className="text-[10px] text-indigo-600">Become a Verified Student</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-500" />
                  </button>
                )}
              </div>

              {/* 3. ACCOUNT & SETTINGS */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                  Account & Settings
                </span>
                <div className="space-y-1">
                  {accountPages.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  addToast('Signed out of demo session', 'info');
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* JOIN / MY ORGANIZATION MODAL FROM SIDEBAR */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>
                  {membershipStatus === 'Verified Student' 
                    ? 'My Organization Details' 
                    : membershipStatus === 'Pending Organization Approval'
                    ? 'Pending Organization Membership'
                    : 'Join an Organization to become a Student'}
                </span>
              </div>
              <button onClick={() => setShowOrgModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {membershipStatus === 'Verified Student' ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-950">{orgName}</h3>
                    <p className="text-xs text-emerald-700 font-medium">Official Verified Student Affiliation</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are officially enrolled under {orgName}. Your academic progress, grades, and certificates are synchronized with institutional faculty.
                </p>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowOrgModal(false)}
                    className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Select an accredited university or enterprise organization from our platform registry. Submitting a request sends your profile to the Organization Admin for student membership verification.
                </p>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {orgsList.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrg(org)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedOrg?.id === org.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{org.name}</h4>
                          <p className="text-[11px] text-slate-500">{org.location} • {org.domain || 'edu'}</p>
                        </div>
                        {selectedOrg?.id === org.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowOrgModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedOrg || submittingOrg}
                    onClick={handleRequestJoinOrg}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
                  >
                    {submittingOrg ? 'Submitting...' : 'Submit Join Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
