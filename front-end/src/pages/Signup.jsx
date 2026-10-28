import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Layers,
} from 'lucide-react';
import { Brand } from '../components/brand/Brand';
import { api } from '../services/api';
const roles = [
  ['Student', 'Learner', GraduationCap],
  ['Instructor', 'Instructor', BookOpen],
  ['Organization', 'Organization', Building2],
];
function roleFrom(value) {
  return (
    {
      student: 'Student',
      learner: 'Student',
      instructor: 'Instructor',
      organization: 'Organization',
      org: 'Organization',
      admin: 'Admin',
      superadmin: 'SuperAdmin',
    }[
      String(value || 'Student')
        .toLowerCase()
        .replace(/[\s_-]/g, '')
    ] || 'Student'
  );
}
export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = roleFrom(
    new URLSearchParams(location.search).get('role') || location.state?.role,
  );
  const restricted = ['Admin', 'SuperAdmin'].includes(role);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    expertise: '',
  });
  const [show, setShow] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const checks = [
    ['At least 6 characters', form.password.length >= 6],
    [
      'Uppercase and lowercase',
      /[A-Z]/.test(form.password) && /[a-z]/.test(form.password),
    ],
    [
      'A number and a symbol',
      /[0-9]/.test(form.password) && /[^A-Za-z0-9\s]/.test(form.password),
    ],
  ];
  const update = (key, value) => {
    setForm({ ...form, [key]: value });
    setError('');
  };
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (checks.some(([, valid]) => !valid)) {
      setError('Please meet the password requirements below.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await api.auth.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
        ...(role === 'Student' && form.university.trim()
          ? { university: form.university.trim() }
          : {}),
        ...(role === 'Instructor' && form.expertise.trim()
          ? { expertise: form.expertise.trim() }
          : {}),
      });
      if (result?.pendingVerification) {
        setNotice(result.message);
        setForm({ ...form, password: '' });
        return;
      }
      if (!result?.token || !result.user?.id)
        throw new Error('The server did not return a valid account.');
      const u = result.user;
      for (const [key, value] of Object.entries({
        nexuspay_auth_token: result.token,
        auth_token: result.token,
        user_id: u.id,
        nexuspay_user_id: u.id,
        user_role: u.role,
        nexuspay_active_role: u.role,
        user_name: u.name,
        user_email: u.email,
        nexuspay_user_email: u.email,
        user_organization_id: u.organizationId || '',
        user_organization_name: u.organizationName || '',
        nexuspay_instructor_id: u.instructorId || '',
      }))
        localStorage.setItem(key, String(value ?? ''));
      navigate(
        {
          Student: '/student/dashboard',
          Instructor: '/instructor/dashboard',
          Organization: '/org/dashboard',
        }[u.role],
        { replace: true },
      );
    } catch (e) {
      setError(e.message || 'Could not create your account.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="academy-auth saas-auth learner-signup">
      <header>
        <Brand />
        <Link
          className="academy-text-link"
          to={`/signin?role=${role}`}
        >
          Already have an account? Sign in
          <ArrowRight size={14} />
        </Link>
      </header>
      <main>
        <section className="saas-auth-context">
          <span className="saas-product-mark">
            <Layers size={26} />
          </span>
          <p className="learner-kicker mt-6">Your next chapter</p>
          <h2>
            Make room
            <br />
            for what’s next.
          </h2>
          <p>
            Discover courses, build your skills, and keep your learning in one
            place.
          </p>
          <div
            className="saas-role-list"
            aria-label="Account type"
          >
            {roles.map(([value, label, Icon]) => (
              <button
                type="button"
                key={value}
                aria-pressed={role === value}
                onClick={() => {
                  setError('');
                  navigate(`/signup?role=${value}`, { replace: true });
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
          <div className="learner-signup-note">
            <BookOpen size={19} />
            <p>
              Your courses, progress, certificates and support stay connected to
              your account.
            </p>
          </div>
        </section>
        <section className="saas-auth-form">
          <span className="saas-auth-role">
            {restricted
              ? 'Authorized access'
              : `${roles.find(([value]) => value === role)?.[1]} account`}
          </span>
          <h1>{restricted ? 'Staff sign-in' : 'Create your account'}</h1>
          {restricted ? (
            <>
              <p>
                Administrator accounts are provisioned for authorized staff.
                Public registration is unavailable.
              </p>
              <Link
                className="academy-btn academy-btn-dark mt-6"
                to={`/signin?role=${role}`}
              >
                Sign in
                <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <p>Start with your name and email.</p>
              {notice && (
                <p
                  className="admin-success"
                  role="status"
                >
                  {notice} <Link to="/signin">Back to sign in</Link>
                </p>
              )}
              {error && (
                <p
                  className="workspace-error"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <form onSubmit={submit}>
                <label>
                  {role === 'Organization'
                    ? 'Institute or organization name'
                    : 'Full name'}
                  <input
                    autoComplete={
                      role === 'Organization' ? 'organization' : 'name'
                    }
                    required
                    minLength={2}
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </label>
                <label>
                  Email address
                  <input
                    autoComplete="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder={
                      role === 'Student'
                        ? 'name@gmail.com'
                        : 'you@institution.com'
                    }
                  />
                </label>
                {role === 'Student' && (
                  <label>
                    Institute{' '}
                    <small className="font-normal text-slate-400">
                      (optional)
                    </small>
                    <input
                      autoComplete="organization"
                      maxLength={120}
                      value={form.university}
                      onChange={(e) => update('university', e.target.value)}
                    />
                  </label>
                )}
                {role === 'Instructor' && (
                  <label>
                    Area of expertise{' '}
                    <small className="font-normal text-slate-400">
                      (optional)
                    </small>
                    <input
                      maxLength={160}
                      value={form.expertise}
                      onChange={(e) => update('expertise', e.target.value)}
                    />
                  </label>
                )}
                <label>
                  Password
                  <div className="saas-password">
                    <input
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
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
                <ul
                  className="learner-password-checks"
                  aria-label="Password requirements"
                >
                  {checks.map(([label, valid]) => (
                    <li
                      key={label}
                      className={valid ? 'is-valid' : ''}
                    >
                      <Check size={12} />
                      {label}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={busy}
                  className="academy-btn academy-btn-dark"
                  type="submit"
                >
                  {busy ? 'Creating account…' : 'Create account'}
                  <ArrowRight size={15} />
                </button>
              </form>
              <p className="saas-auth-footnote">
                Already registered?{' '}
                <Link to={`/signin?role=${role}`}>
                  Sign in to your workspace
                </Link>
              </p>
            </>
          )}
        </section>
      </main>
      <footer>
        <span>Acadex</span>
        <Link to="/">Back to website</Link>
      </footer>
    </div>
  );
}
