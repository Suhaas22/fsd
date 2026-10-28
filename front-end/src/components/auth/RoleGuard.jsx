import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const TOKEN_KEYS = [
  'nexuspay_auth_token',
  'auth_token',
  'nexuspay_student_token',
];
const ROLE_KEYS = ['nexuspay_active_role', 'user_role'];

function readStoredValue(keys) {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value && value !== 'null' && value !== 'undefined' && value.trim())
      return value.trim();
  }
  return '';
}

export default function RoleGuard({ allowedRoles, loginRole }) {
  const location = useLocation();
  const token = readStoredValue(TOKEN_KEYS);
  const role = readStoredValue(ROLE_KEYS)
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  const isAllowed =
    token &&
    allowedRoles.some(
      (allowedRole) =>
        allowedRole.toLowerCase().replace(/[\s_-]+/g, '') === role
    );

  if (!isAllowed) {
    return (
      <Navigate
        to={`/signin?role=${encodeURIComponent(loginRole)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
