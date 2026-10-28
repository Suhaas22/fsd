import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Layers } from 'lucide-react';
import { Brand } from '../components/brand/Brand';
import { api } from '../services/api';
const paths = {
  Student: '/student',
  Instructor: '/instructor',
  Organization: '/org',
  Admin: '/admin',
  SuperAdmin: '/super-admin',
};
function normalize(role) {
  const r = String(role || '')
    .replace(/[\s_-]/g, '')
    .toLowerCase();
  return (
    {
      learner: 'Student',
      student: 'Student',
      instructor: 'Instructor',
      organization: 'Organization',
      org: 'Organization',
      admin: 'Admin',
      superadmin: 'SuperAdmin',
    }[r] || null
  );
}
export default function SignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function login(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await api.auth.login(email.trim(), password);
      if (!result?.token || !result.user?.id)
        throw new Error('The server did not return a valid account.');
      const user = result.user;
      const resolved = normalize(user.role);
      if (!resolved)
        throw new Error(
          'This account has an unsupported workspace. Please contact support.',
        );
      for (const [key, value] of Object.entries({
        nexuspay_auth_token: result.token,
        auth_token: result.token,
        user_id: user.id,
        nexuspay_user_id: user.id,
        user_role: resolved,
        nexuspay_active_role: resolved,
        user_name: user.name || '',
        user_email: user.email || email.trim(),
        nexuspay_user_email: user.email || email.trim(),
        user_organization_id: user.organizationId || '',
        user_organization_name: user.organizationName || '',
        nexuspay_instructor_id: user.instructorId || '',
      }))
        localStorage.setItem(key, String(value));
      const from = location.state?.from;
      const prefix = paths[resolved];
      const destination = from?.pathname?.startsWith(prefix + '/')
        ? from.pathname + (from.search || '')
        : prefix + '/dashboard';
      navigate(destination, { replace: true });
    } catch (e) {
      setError(e.message || 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="academy-auth saas-auth unified-signin">
      <header>
        <Brand />
        <Link
          className="academy-text-link"
          to="/signup"
        >
          Create account
          <ArrowRight size={14} />
        </Link>
      </header>
      <main>
        <section className="saas-auth-context">
          <span className="saas-product-mark">
            <Layers size={26} />
          </span>
          <h2>
            Learning.
            <br />
            Teaching.
            <br />
            Connected.
          </h2>
          <p>
            One workspace for learners, teaching teams, and platform operations.
          </p>
        </section>
        <section className="saas-auth-form">
          <span className="saas-auth-role">Welcome to Acadex</span>
          <h1>Sign in</h1>
          <p>Sign in with your email and password to open your workspace.</p>
          {error && (
            <div
              className="workspace-error"
              role="alert"
            >
              {error}
            </div>
          )}
          <form onSubmit={login}>
            <label>
              Email address
              <input
                autoComplete="username"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </label>
            <label>
              Password
              <div className="saas-password">
                <input
                  autoComplete="current-password"
                  required
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <Link
              to="/forgot-password"
              className="saas-forgot"
            >
              Forgot password?
            </Link>
            <button
              className="academy-btn academy-btn-dark"
              disabled={busy}
              type="submit"
            >
              {busy ? 'Signing in…' : 'Sign in'}
              <ArrowRight size={15} />
            </button>
          </form>
          <p className="saas-auth-footnote">
            New to Acadex? <Link to="/signup">Create an account</Link>
          </p>
        </section>
      </main>
      <footer>
        <span>Acadex</span>
        <Link to="/">Back to website</Link>
      </footer>
    </div>
  );
}
