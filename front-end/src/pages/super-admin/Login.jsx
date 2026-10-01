import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react';

// ── Demo credential (matches api.js MOCK_CREDENTIALS) ──────────────────────
const SUPER_ADMIN_EMAIL    = 'superadmin@nexuspay-platform.io';
const SUPER_ADMIN_PASSWORD = 'Password123!';

export default function SuperAdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail]               = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword]         = useState(SUPER_ADMIN_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  // If already authenticated as Super Admin, bounce straight to dashboard
  useEffect(() => {
    const role  = localStorage.getItem('nexuspay_active_role') || localStorage.getItem('user_role');
    const token = localStorage.getItem('nexuspay_auth_token')  || localStorage.getItem('auth_token');
    if (token && role === 'SuperAdmin') {
      navigate('/super-admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !validateEmail(email.trim())) {
      setError('Please enter a valid super-admin email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Try real backend first, fall back to mock credential check
      let token, userName;

      const isCorrectCredentials =
        email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() &&
        password === SUPER_ADMIN_PASSWORD;

      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || 'http://localhost:3000/api') + '/auth/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password, role: 'SuperAdmin' }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data ?? data;
          if (payload?.token) {
            token    = payload.token;
            userName = payload.user?.name || 'Super Admin';
          }
        }
      } catch {
        /* backend offline – fall through to mock */
      }

      if (!token) {
        // Offline mock fallback
        if (!isCorrectCredentials) {
          throw new Error('Invalid super-admin credentials. Access denied.');
        }
        token    = `jwt-mock-superadmin-${Date.now()}`;
        userName = 'Platform Super Admin';
      }

      // Persist session
      localStorage.setItem('nexuspay_auth_token', token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('nexuspay_active_role', 'SuperAdmin');
      localStorage.setItem('user_role', 'SuperAdmin');
      localStorage.setItem('user_name', userName);
      localStorage.setItem('user_email', email.trim());

      setSuccessMsg(`Welcome, ${userName}! Loading super admin portal…`);

      setTimeout(() => {
        navigate('/super-admin/dashboard', { replace: true });
      }, 700);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">

      {/* ── Ambient glow orbs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#0056D2] rounded-full opacity-[0.08] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-700 rounded-full opacity-[0.08] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0056D2] rounded-full opacity-[0.03] blur-[160px]" />
      </div>

      {/* ── Subtle grid overlay ───────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* ── Back to main portal ───────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
          >
            ← Back to EduSphere
          </Link>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0056D2] to-[#003B9A] shadow-lg shadow-[#0056D2]/30 mb-5">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-[#0056D2]/40 text-[#388BFD] text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Super Admin Portal</span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Platform Governance
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              Restricted to authorised platform administrators only.
            </p>
          </div>

          {/* Live status pill */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Platform Online
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <Activity className="w-3 h-3" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Error / Success alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="superadmin-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  placeholder="superadmin@nexuspay-platform.io"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#0056D2] focus:bg-slate-800 focus:ring-2 focus:ring-[#0056D2]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="superadmin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-800/70 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#0056D2] focus:bg-slate-800 focus:ring-2 focus:ring-[#0056D2]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                id="superadmin-login-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0056D2] to-[#003B9A] hover:from-[#0063F0] hover:to-[#0050BF] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#0056D2]/25 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Access Super Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#388BFD] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300 block mb-0.5">Demo credentials pre-filled</span>
              Fields are pre-populated with the platform super admin account for quick access.
            </div>
          </div>

          {/* Divider + other portal link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-500">
            Not a super admin?{' '}
            <Link
              to="/signin"
              className="text-[#388BFD] hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in to your role portal →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-slate-600">
          EduSphere Super Admin Console • Restricted Access • All sessions are audited
        </p>
      </div>
    </div>
  );
}
