import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine initial role from query params, state, or path
  const resolveRole = () => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role') || location.state?.role;
    if (roleParam) {
      const lower = roleParam.toLowerCase();
      if (lower.includes('org') || lower.includes('organization')) return 'Organization';
      if (lower.includes('instructor') || lower.includes('educator')) return 'Instructor';
      if (lower.includes('admin') || lower.includes('super')) return 'Admin';
      return 'Student';
    }
    if (location.pathname.includes('/org/')) return 'Organization';
    if (location.pathname.includes('/instructor/')) return 'Instructor';
    if (location.pathname.includes('/admin/')) return 'Admin';
    return 'Student';
  };

  const initialRole = resolveRole();
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state for Google SSO & University SAML
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showSamlModal, setShowSamlModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customSamlDomain, setCustomSamlDomain] = useState('');

  // Preset demo accounts for quick testing & live updating titles
  const demoAccounts = {
    Student: {
      email: 'alex.chen@stanford.edu',
      password: 'Password123!',
      name: 'Alex Chen',
      subtitle: 'Enrolled in 4 AI & CS Specializations',
      redirect: '/student/dashboard',
      badge: 'Student / Learner',
      title: 'Student / Learner',
      buttonLabel: 'Student'
    },
    Instructor: {
      email: 'sarah.jenkins@university.edu',
      password: 'Password123!',
      name: 'Dr. Sarah Jenkins',
      subtitle: 'Faculty Professor • 1,240 Enrolled Students',
      redirect: '/instructor/dashboard',
      badge: 'Instructor / Faculty',
      title: 'Instructor / Educator',
      buttonLabel: 'Instructor'
    },
    Organization: {
      email: 'admin@nexuspay.edu',
      password: 'Password123!',
      name: 'Nexus Academy Admin',
      subtitle: 'Enterprise Team & Faculty Governance',
      redirect: '/org/dashboard',
      badge: 'Organization Admin',
      title: 'Organization Admin',
      buttonLabel: 'Organization Admin'
    },
    Admin: {
      email: 'superadmin@nexuspay-platform.io',
      password: 'Password123!',
      name: 'Platform Super Admin',
      subtitle: 'Global Operations & System Approvals',
      redirect: '/admin/dashboard',
      badge: 'Super Admin',
      title: 'Super Admin',
      buttonLabel: 'Super Admin'
    }
  };

  // Google SSO mock accounts
  const googleAccounts = [
    {
      name: 'Alex Johnson',
      email: 'alex.johnson.edu@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'Student',
      badge: 'Learner Workspace',
      redirect: '/student/dashboard'
    },
    {
      name: 'Dr. Sarah Jenkins',
      email: 'dr.sarah.jenkins.ai@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'Instructor',
      badge: 'Faculty Professor',
      redirect: '/instructor/dashboard'
    },
    {
      name: 'Nexus Academy Admin',
      email: 'enterprise.ops.global@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'Organization',
      badge: 'Organization Admin',
      redirect: '/org/dashboard'
    }
  ];

  // University SAML mock identity providers
  const samlProviders = [
    {
      university: 'Stanford University',
      protocol: 'Shibboleth SAML 2.0 / NetID',
      sampleEmail: 'alex.j@stanford.edu',
      role: 'Student',
      logo: '🏛️',
      redirect: '/student/dashboard'
    },
    {
      university: 'Massachusetts Institute of Technology (MIT)',
      protocol: 'MIT Touchstone SAML SSO',
      sampleEmail: 'sarah.jenkins@mit.edu',
      role: 'Instructor',
      logo: '🔬',
      redirect: '/instructor/dashboard'
    },
    {
      university: 'Imperial College London',
      protocol: 'Imperial Single Sign-On (SSO)',
      sampleEmail: 'admin@imperial.ac.uk',
      role: 'Organization',
      logo: '🎓',
      redirect: '/org/dashboard'
    },
    {
      university: 'Harvard University',
      protocol: 'HarvardKey Federated Login',
      sampleEmail: 'superadmin@harvard.edu',
      role: 'Admin',
      logo: '📚',
      redirect: '/admin/dashboard'
    }
  ];

  // Sync credentials on mount or role change
  useEffect(() => {
    const role = resolveRole();
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].password);
    setError('');
  }, [location.search, location.state]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].password);
  };

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const meetsPasswordCriteria = (value) => (
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(value) &&
    value.length >= 6
  );

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    // Form validations
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address (e.g. name@university.edu).');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (!meetsPasswordCriteria(password)) {
      setError('Password must include an uppercase letter, lowercase letter, number, special symbol, and at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.login(email.trim(), password, selectedRole);

      if (res && res.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('nexuspay_auth_token', res.token);
        localStorage.setItem('user_id', res.user?.id || '');
        localStorage.setItem('nexuspay_active_role', res.user?.role || selectedRole);
        localStorage.setItem('user_role', res.user?.role || selectedRole);
        localStorage.setItem('user_name', res.user?.name || demoAccounts[selectedRole].name);
        localStorage.setItem('user_email', res.user?.email || email);

        const authenticatedRole = res.user?.role || selectedRole;
        const redirectByRole = {
          Student: '/student/dashboard',
          Learner: '/student/dashboard',
          Instructor: '/instructor/dashboard',
          Educator: '/instructor/dashboard',
          Organization: '/org/dashboard',
          Admin: '/admin/dashboard',
        };
        setSuccessMsg(`Welcome back, ${res.user?.name || email}! Redirecting to your portal...`);

        setTimeout(() => {
          navigate(redirectByRole[authenticatedRole] || '/student/dashboard');
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google Account Select Handler
  const handleSelectGoogleAccount = (acc) => {
    setShowGoogleModal(false);
    setLoading(true);
    setError('');
    setSuccessMsg(`Signing in with Google as ${acc.name} (${acc.email})...`);

    localStorage.setItem('auth_token', `jwt-google-${Date.now()}`);
    localStorage.setItem('user_role', acc.role);
    localStorage.setItem('user_name', acc.name);
    localStorage.setItem('user_email', acc.email);

    setTimeout(() => {
      navigate(acc.redirect);
    }, 700);
  };

  // Custom Google Login
  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !validateEmail(customGoogleEmail.trim())) {
      setError('Please enter a valid Google email address.');
      return;
    }
    setShowGoogleModal(false);
    setLoading(true);
    setError('');
    setSuccessMsg(`Signing in with Google as ${customGoogleEmail}...`);

    localStorage.setItem('auth_token', `jwt-google-${Date.now()}`);
    localStorage.setItem('user_role', 'Student');
    localStorage.setItem('user_name', customGoogleEmail.split('@')[0]);
    localStorage.setItem('user_email', customGoogleEmail);

    setTimeout(() => {
      navigate('/student/dashboard');
    }, 700);
  };

  // SAML Provider Select Handler
  const handleSelectSamlProvider = (prov) => {
    setShowSamlModal(false);
    setLoading(true);
    setError('');
    setSuccessMsg(`Authenticating via ${prov.university} (${prov.protocol})...`);

    localStorage.setItem('auth_token', `jwt-saml-${Date.now()}`);
    localStorage.setItem('user_role', prov.role);
    localStorage.setItem('user_name', `${prov.university} Verified User`);
    localStorage.setItem('user_email', prov.sampleEmail);

    setTimeout(() => {
      navigate(prov.redirect);
    }, 700);
  };

  const roles = [
    { key: 'Student', label: 'Student / Learner', icon: GraduationCap, color: 'text-emerald-700', border: 'border-emerald-300' },
    { key: 'Instructor', label: 'Instructor / Faculty', icon: Users, color: 'text-indigo-700', border: 'border-indigo-300' },
    { key: 'Organization', label: 'Organization Admin', icon: Building2, color: 'text-blue-700', border: 'border-blue-300' },
    { key: 'Admin', label: 'Platform Super Admin', icon: ShieldCheck, color: 'text-purple-700', border: 'border-purple-300' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between font-sans relative">
      
      {/* Top Header */}
      <header className="border-b border-[#E5DDD2] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center font-black text-white text-base shadow-sm group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Edu<span className="text-blue-600">Sphere</span>
            </span>
          </Link>

          {/* Top-Right: Fully Visible Role-Aware "Don't have an account? Sign up" */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="text-slate-600 font-medium">Don't have an account?</span>
            <Link
              to={`/signup?role=${selectedRole}`}
              state={{ role: selectedRole }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Quick Role Switcher */}
          <div className="lg:col-span-5 bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Multi-Actor Unified Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Select Your Role Portal
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Choose the workspace you would like to access with verified credentials.
              </p>
            </div>

            {/* Role Radio Cards */}
            <div className="space-y-2.5 my-6">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleRoleChange(r.key)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 shadow-sm text-slate-900'
                        : 'bg-[#FAF7F2] border-[#E0D7CB] text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white border border-[#E0D7CB] ' + r.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{r.label}</div>
                        <div className="text-[11px] text-slate-500">{demoAccounts[r.key].subtitle}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Demo Pre-fill Note */}
            <div className="p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#E5DDD2] text-xs text-slate-600 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Instant Demo Access</span>
                Clicking any role above automatically pre-populates verified credentials from <code className="text-blue-700 font-bold">users.json</code>.
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Form Card */}
          <div className="lg:col-span-7 bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-10 shadow-lg shadow-stone-900/5 flex flex-col justify-center">
            
            {/* Dynamic Sign-in Title & Badge Updated by Selected Role */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {demoAccounts[selectedRole]?.badge || selectedRole} Portal
                </span>
                <span className="text-xs text-slate-500">JSON Mock API Connected</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                Sign In as {demoAccounts[selectedRole]?.title || selectedRole}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Enter your credentials to access the {demoAccounts[selectedRole]?.title || selectedRole} workspace on EduSphere.
              </p>
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

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
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
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    state={{ email }}
                    className="text-xs text-blue-700 hover:text-blue-800 font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
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

                {/* Password Criteria Indicators */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-2.5 bg-[#FAF7F2] border border-[#E5DDD2] rounded-xl">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5 font-medium">
                      <span>Password format requirements:</span>
                      <span className={
                        /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) && password.length >= 6
                          ? 'text-emerald-700 font-bold'
                          : 'text-amber-700 font-semibold'
                      }>
                        {/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) && password.length >= 6
                          ? 'All criteria met ✓'
                          : 'Standard format'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[A-Z]/.test(password) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[A-Z]/.test(password) ? '✓' : '•'} 1 Capital letter (A-Z)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[a-z]/.test(password) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[a-z]/.test(password) ? '✓' : '•'} Small letters (a-z)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[0-9]/.test(password) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[0-9]/.test(password) ? '✓' : '•'} 1 Number (0-9)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) ? '✓' : '•'} 1 Special symbol (!@#$)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${password.length >= 6 ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {password.length >= 6 ? '✓' : '•'} 6+ Chars
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E0D7CB] text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600">Remember this device for 30 days</span>
                </label>
              </div>

              {/* Dynamic Submit Button with Selected Role */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {demoAccounts[selectedRole]?.buttonLabel || selectedRole}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Social / SSO Mock Gateway */}
            <div className="mt-6 pt-6 border-t border-[#F2ECE4]">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block text-center font-bold mb-3">
                Or continue with enterprise SSO
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[#E0D7CB] hover:border-blue-400 text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google SSO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSamlModal(true)}
                  className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-white border border-[#E0D7CB] hover:border-blue-400 text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>University SAML</span>
                </button>
              </div>
            </div>

            {/* Fully Visible Terms of Service and Privacy Policy Links */}
            <div className="mt-6 text-center text-xs text-slate-600 leading-relaxed">
              By signing in, you agree to EduSphere's{' '}
              <Link to="/terms" className="text-blue-700 font-bold underline hover:text-blue-800">
                Terms of Service
              </Link>
              ,{' '}
              <Link to="/privacy" className="text-blue-700 font-bold underline hover:text-blue-800">
                Privacy Policy
              </Link>
              , and{' '}
              <Link to="/honor-code" className="text-blue-700 font-bold underline hover:text-blue-800">
                Academic Honor Code
              </Link>
              .
            </div>
          </div>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* GOOGLE SSO ACCOUNT PICKER MODAL */}
      {/* ────────────────────────────────────────────────────────────── */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <h3 className="font-extrabold text-base text-slate-900">Sign in with Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900 block">Choose an account</span>
              <p className="text-xs text-slate-500">to continue to EduSphere Online LMS</p>
            </div>

            {/* Account List */}
            <div className="space-y-2 divide-y divide-[#F2ECE4]">
              {googleAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(acc)}
                  className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-[#FAF7F2] rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{acc.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {acc.badge}
                  </span>
                </button>
              ))}

              {/* Use Another Account Option */}
              <div className="pt-3">
                {showCustomGoogleInput ? (
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-2">
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="Enter another Google email..."
                      className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                    >
                      Continue with Google
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full py-2.5 px-2 flex items-center gap-3 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-[#FAF7F2] rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-slate-500">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>Use another Google account</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-[#F2ECE4] pt-3 text-center">
              To continue, Google will share your name, email address, and profile picture with EduSphere.
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* UNIVERSITY SAML IDENTITY PROVIDER MODAL */}
      {/* ────────────────────────────────────────────────────────────── */}
      {showSamlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">University SAML 2.0 Single Sign-On</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSamlModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900 block">Select your Academic Institution</span>
              <p className="text-xs text-slate-500">Authenticate through your campus Shibboleth / SAML gateway</p>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {samlProviders.map((prov, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSamlProvider(prov)}
                  className="w-full p-3 bg-[#FAF7F2] hover:bg-white border border-[#E0D7CB] hover:border-blue-400 rounded-2xl flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prov.logo}</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600">
                        {prov.university}
                      </div>
                      <div className="text-[11px] text-slate-500">{prov.protocol} • <span className="text-blue-700">{prov.sampleEmail}</span></div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#F2ECE4]">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or enter custom University domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSamlDomain}
                  onChange={(e) => setCustomSamlDomain(e.target.value)}
                  placeholder="e.g. oxford.ac.uk or berkeley.edu"
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSamlDomain) {
                      handleSelectSamlProvider({
                        university: customSamlDomain,
                        protocol: 'Custom Institutional SAML',
                        sampleEmail: `user@${customSamlDomain}`,
                        role: 'Student',
                        redirect: '/student/dashboard'
                      });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                >
                  Connect
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E5DDD2] bg-[#FAF7F2] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 EduSphere Global Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link to="/honor-code" className="hover:text-blue-600 transition-colors">Honor Code</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
