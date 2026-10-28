import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/admin-panels.css';

export default function VerifyCertificate() {
  const { credentialId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    setResult(null);
    setError('');
    api.certificates
      .verify(encodeURIComponent(credentialId))
      .then((data) => {
        if (live) setResult(data);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [credentialId]);
  const certificate = result?.certificate;
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <section className="admin-card max-w-xl w-full space-y-4">
        <h1 className="admin-heading">Certificate verification</h1>
        {error ? (
          <p
            role="alert"
            className="admin-alert"
          >
            {error}
          </p>
        ) : certificate ? (
          <>
            <p className="admin-success">
              Credential found in the platform records.
            </p>
            <h2 className="text-2xl font-bold">{certificate.learnerName}</h2>
            <p className="admin-muted">
              {certificate.learnerEmail || 'Email not recorded'}
            </p>
            <p className="text-lg font-semibold">{certificate.courseTitle}</p>
            <p className="text-xs text-slate-500 break-all">
              {certificate.credentialId || certificate.id}
            </p>
            <p className="text-sm">
              Status: {certificate.status || 'Not recorded'}
            </p>
          </>
        ) : (
          <p className="admin-muted">Checking credential…</p>
        )}
        <Link
          className="text-sm text-blue-700 font-semibold"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
