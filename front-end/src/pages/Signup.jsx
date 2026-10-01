import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  School,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  ShieldAlert,
  KeyRound,
  Shield
} from 'lucide-react';
import { api } from '../services/api';

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine role from query params, state, or path
  const resolveRole = () => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') || location.state?.role;
    if (roleParam) {
      const lower = roleParam.toLowerCase();
      if (lower.includes('admin') || lower.includes('super')) return 'Admin';
      if (lower.includes('instructor') || lower.includes('educator')) return 'Instructor';
      if (lower.includes('org') || lower.includes('organization')) return 'Organization';
      return 'Student';
    }
    return 'Student';
  };

  const [role, setRole] = useState(resolveRole()); // 'Student' | 'Instructor' | 'Organization' | 'Admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState('');
  const [expertise, setExpertise] = useState('Computer Science & AI');
  const [organizationName, setOrganizationName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKeyInput, setShowAdminKeyInput] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync role when URL params or state change
  useEffect(() => {
    const targetRole = resolveRole();
    setRole(targetRole);
    setError('');
  }, [location.search, location.state]);

  // Password criteria evaluations
  const passwordCriteria = {
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
    hasLength: password.length >= 6
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-stone-300' };
    const passedCount = Object.values(passwordCriteria).filter(Boolean).length;

    switch (passedCount) {
      case 1:
        return { score: 20, label: 'Very Weak', color: 'bg-red-500' };
      case 2:
        return { score: 40, label: 'Weak', color: 'bg-orange-500' };
      case 3:
        return { score: 60, label: 'Fair', color: 'bg-amber-500' };
      case 4:
        return { score: 80, label: 'Good', color: 'bg-blue-600' };
      case 5:
        return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-600' };
      default:
        return { score: 10, label: 'Too short', color: 'bg-red-500' };
    }
  };

  const strength = getPasswordStrength();

  const handleRoleTabClick = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccessMsg('');
    navigate(`/signup?role=${newRole}`, { replace: true, state: { role: newRole } });
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all mandatory account information.');
      return;
    }

    if (!passwordCriteria.hasLength || !passwordCriteria.hasUpper || !passwordCriteria.hasLower || !passwordCriteria.hasNumber || !passwordCriteria.hasSpecial) {
      const missing = [];
      if (!passwordCriteria.hasUpper) missing.push('1 uppercase capital letter (A-Z)');
      if (!passwordCriteria.hasLower) missing.push('lowercase small letters (a-z)');
      if (!passwordCriteria.hasNumber) missing.push('1 number (0-9)');
      if (!passwordCriteria.hasSpecial) missing.push('1 special symbol (!@#$...)');
      if (!passwordCriteria.hasLength) missing.push('at least 6 characters');
      setError(`Password must include: ${missing.join(', ')}.`);
      return;
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service to proceed.');
      return;
    }

    // Admin key validation if creating authorized super admin
    if (role === 'Admin') {
      if (!adminKey || adminKey !== 'AGY-SUPER-ROOT-2026') {
        setError('Invalid Super Admin Master Authorization Key. Authorized provisioning required.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      name,
      email,
      password,
      role,
      university: role === 'Student' ? university || 'Global Open Learner' : undefined,
      expertise: role === 'Instructor' ? expertise : undefined,
      organizationName: role === 'Organization' ? organizationName || 'Enterprise Academy' : undefined
    };

    try {
      const res = await api.auth.register(payload);

      if (res && res.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('nexuspay_auth_token', res.token);
        localStorage.setItem('user_id', res.user?.id || '');
        localStorage.setItem('nexuspay_active_role', res.user?.role || role);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_email', email);

        setSuccessMsg(`Welcome to EduSphere, ${name}! Your ${role} account has been created.`);

        setTimeout(() => {
          if (role === 'Student') navigate('/student/dashboard');
          else if (role === 'Instructor') navigate('/instructor/dashboard');
          else if (role === 'Organization') navigate('/org/dashboard');
          else if (role === 'Admin') navigate('/admin/dashboard');
          else navigate('/');
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'Student', label: 'Student / Learner', icon: GraduationCap },
    { id: 'Instructor', label: 'Instructor / Faculty', icon: Users },
    { id: 'Organization', label: 'Organization Admin', icon: Building2 },
    { id: 'Admin', label: 'Platform Super Admin', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="border-b border-[#E5DDD2] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center font-black text-white text-base shadow-sm group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Edu<span className="text-blue-600">Sphere</span>
            </span>
          </Link>

          {/* Role-Aware Top-Right Sign In Link */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-slate-600 font-medium">Already have an account?</span>
            <Link
              to={`/signin?role=${role === 'Admin' ? 'Admin' : role}`}
              state={{ role }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2ECE4] text-blue-700 font-bold transition-all border border-[#E0D7CB] shadow-2xs text-xs sm:text-sm"
            >
              Sign In as {role === 'Admin' ? 'Super Admin' : role}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Benefits & Trust Pillars */}
          <div className="lg:col-span-5 bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {role === 'Student' && 'Learner Workspace'}
                  {role === 'Instructor' && 'Educator Studio'}
                  {role === 'Organization' && 'Enterprise Academy'}
                  {role === 'Admin' && 'Super Governance'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {role === 'Student' && 'Join 120,000+ ambitious learners & scholars'}
                {role === 'Instructor' && 'Publish courses & mentor global students'}
                {role === 'Organization' && 'Upskill and govern your enterprise workforce'}
                {role === 'Admin' && 'Global Operations & System Approvals'}
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {role === 'Student' && 'Gain verified certificates, learn from top university faculty, and accelerate your career.'}
                {role === 'Instructor' && 'Earn revenue, build interactive syllabi, assess quizzes, and issue accredited certificates.'}
                {role === 'Organization' && 'Assign seat licenses, monitor completion telemetry, and orchestrate custom academies.'}
                {role === 'Admin' && 'Platform super administrator privileges are managed under restricted institutional governance.'}
              </p>
            </div>

            <div className="space-y-4 my-6">
              {[
                { title: 'World-Class Curriculum', desc: 'Accredited courses taught by Stanford, MIT, and leading industry faculty.' },
                { title: 'Hands-on Projects & Quizzes', desc: 'Real-world coding exercises, graded assessments, and portfolio items.' },
                { title: 'Shareable Verified Credentials', desc: 'Direct 1-click LinkedIn credential badges and verified digital certificates.' },
                { title: 'Role-Based Architecture', desc: 'Dedicated studios for Students, Educators, and Organization Admins.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-slate-500 leading-snug">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#E5DDD2] text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">100% Free & Open To Join</span>
              Audit hundreds of courses with zero fees, or upgrade anytime for certificates and masterclasses.
            </div>
          </div>

          {/* Right Column: Registration / Restricted Admin Container */}
          <div className="lg:col-span-7 bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-10 shadow-lg shadow-stone-900/5">
            
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {role === 'Admin' ? 'Super Admin Account Creation' : `Create your ${role} Account`}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {role === 'Admin'
                  ? 'Super Admin accounts are created by an authorized administrator.'
                  : `Select your platform role and enter your ${role} credentials below.`}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#FAF7F2] border border-[#E0D7CB] rounded-2xl mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = role === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleRoleTabClick(tab.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 text-center ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate text-[11px]">{tab.label.split(' / ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Error & Success Feedback Alerts */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────────── */}
            {/* 1. RESTRICTED PLATFORM SUPER ADMIN VIEW */}
            {/* ────────────────────────────────────────────────────────────── */}
            {role === 'Admin' ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Restricted Platform Governance</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Super Admin accounts are created by an authorized administrator.</strong> Public registration is restricted to protect root system configurations, financial payouts, and platform moderation rules.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E0D7CB] space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Already have authorized credentials?</span>
                  <p className="text-xs text-slate-600">
                    Sign in with pre-authorized Platform Super Admin credentials (e.g. <code className="text-blue-700 font-bold">superadmin@coursera-platform.io</code>).
                  </p>
                  <Link
                    to="/signin?role=Admin"
                    state={{ role: 'Admin' }}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                  >
                    <span>Sign In as Platform Super Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Optional Authorized Master Key Flow */}
                <div className="border-t border-[#F2ECE4] pt-4">
                  {showAdminKeyInput ? (
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Enter Master Admin Authorization Key
                        </label>
                        <input
                          type="text"
                          required
                          value={adminKey}
                          onChange={(e) => setAdminKey(e.target.value)}
                          placeholder="AGY-SUPER-ROOT-2026"
                          className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Global Operations Lead"
                          className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Email</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ops.lead@platform.io"
                          className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Root Password</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        {loading ? 'Validating Root Key...' : 'Provision Authorized Super Admin'}
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminKeyInput(true);
                        setAdminKey('AGY-SUPER-ROOT-2026');
                        setName('Platform Ops Admin');
                        setEmail('superadmin@coursera-platform.io');
                        setPassword('Password123!');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[#E0D7CB] text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>Have Master Authorization Key? (Demo Provisioning)</span>
                    </button>
                  )}
                </div>

                {/* Switch to Public Roles */}
                <div className="pt-2 text-center text-xs text-slate-500">
                  Looking to learn or teach instead?{' '}
                  <button
                    type="button"
                    onClick={() => handleRoleTabClick('Student')}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    Join as Student
                  </button>{' '}
                  or{' '}
                  <button
                    type="button"
                    onClick={() => handleRoleTabClick('Instructor')}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    Faculty Instructor
                  </button>
                </div>
              </div>
            ) : (
              /* ────────────────────────────────────────────────────────────── */
              /* 2. PUBLIC ROLE REGISTRATION FORM (STUDENT / INSTRUCTOR / ORG) */
              /* ────────────────────────────────────────────────────────────── */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Maya Lin"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@university.edu or name@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>

                {/* Dynamic Role-Specific Field */}
                {role === 'Student' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      University / College / School (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <School className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="e.g. Stanford University or MIT"
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                )}

                {role === 'Instructor' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Teaching Specialization / Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <select
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="Computer Science & AI">Computer Science & Artificial Intelligence</option>
                        <option value="Data Science & Big Data">Data Science & Machine Learning</option>
                        <option value="Business & Strategic Leadership">Business & Strategic Leadership</option>
                        <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                        <option value="Design & Fullstack Engineering">Design & Fullstack Engineering</option>
                      </select>
                    </div>
                  </div>
                )}

                {role === 'Organization' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Organization / Institution Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. Acme Global Academy or Horizon Tech"
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input & Strength Meter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Choose a Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-11 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Live Password Strength & Criteria Checklist */}
                  {password.length > 0 && (
                    <div className="mt-3 p-3 bg-[#FAF7F2] border border-[#E5DDD2] rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Security strength:</span>
                        <span className={`font-bold ${strength.score === 100 ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DDD2] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>

                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordCriteria.hasUpper ? 'text-emerald-800 font-semibold' : 'text-slate-500'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${passwordCriteria.hasUpper ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-400 border border-[#E0D7CB]'}`}>
                            {passwordCriteria.hasUpper ? '✓' : '•'}
                          </div>
                          <span>1 Capital letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordCriteria.hasLower ? 'text-emerald-800 font-semibold' : 'text-slate-500'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${passwordCriteria.hasLower ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-400 border border-[#E0D7CB]'}`}>
                            {passwordCriteria.hasLower ? '✓' : '•'}
                          </div>
                          <span>Small letters (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordCriteria.hasNumber ? 'text-emerald-800 font-semibold' : 'text-slate-500'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${passwordCriteria.hasNumber ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-400 border border-[#E0D7CB]'}`}>
                            {passwordCriteria.hasNumber ? '✓' : '•'}
                          </div>
                          <span>1 Number (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${passwordCriteria.hasSpecial ? 'text-emerald-800 font-semibold' : 'text-slate-500'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${passwordCriteria.hasSpecial ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-400 border border-[#E0D7CB]'}`}>
                            {passwordCriteria.hasSpecial ? '✓' : '•'}
                          </div>
                          <span>1 Special symbol (!@#$...)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 sm:col-span-2 transition-colors ${passwordCriteria.hasLength ? 'text-emerald-800 font-semibold' : 'text-slate-500'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${passwordCriteria.hasLength ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-400 border border-[#E0D7CB]'}`}>
                            {passwordCriteria.hasLength ? '✓' : '•'}
                          </div>
                          <span>At least 6 characters</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E0D7CB] text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      I agree to the <Link to="/terms" className="text-blue-700 underline font-semibold">Terms of Service</Link>,{' '}
                      <Link to="/honor-code" className="text-blue-700 underline font-semibold">Honor Code</Link>, and{' '}
                      <Link to="/privacy" className="text-blue-700 underline font-semibold">Privacy Policy</Link>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating your {role} profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Join EduSphere as {role === 'Organization' ? 'Organization Admin' : role}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-[#F2ECE4] text-center text-xs text-slate-500">
              Already registered?{' '}
              <Link
                to={`/signin?role=${role === 'Admin' ? 'Admin' : role}`}
                state={{ role }}
                className="text-blue-700 hover:text-blue-800 font-bold"
              >
                Sign in to {role === 'Admin' ? 'Super Admin' : role} portal
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5DDD2] bg-[#FAF7F2] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 EduSphere Global Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/student/explore" className="hover:text-blue-600 transition-colors">Course Catalog</Link>
            <Link to="/signin" className="hover:text-blue-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
