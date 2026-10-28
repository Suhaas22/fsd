import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const documents = {
  '/terms': 'Terms of Service',
  '/privacy': 'Privacy Policy',
  '/honor-code': 'Honor Code',
};

export default function UnavailablePage() {
  const { pathname } = useLocation();
  const title = documents[pathname];
  const role = (
    localStorage.getItem('nexuspay_active_role') ||
    localStorage.getItem('user_role') ||
    ''
  )
    .toLowerCase()
    .replace(/[\s_-]/g, '');
  const home =
    {
      student: '/student/dashboard',
      learner: '/student/dashboard',
      instructor: '/instructor/dashboard',
      organization: '/org/dashboard',
      admin: '/admin/dashboard',
      superadmin: '/super-admin/dashboard',
    }[role] || '/';
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <section className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {title || 'Page not found'}
        </h1>
        <p className="text-slate-600">
          {title
            ? 'This document has not been published. Contact the platform administrator for a copy.'
            : 'This address does not match an available page. Check the link or return to your dashboard.'}
        </p>
        <Link
          to={home}
          className="inline-block font-semibold text-blue-700"
        >
          {home === '/' ? 'Return home' : 'Return to dashboard'} →
        </Link>
      </section>
    </main>
  );
}
