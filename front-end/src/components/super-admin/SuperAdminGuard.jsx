import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * SuperAdminGuard
 * Wraps the SuperAdminLayout Outlet — redirects to the super-admin
 * login page when there is no valid SuperAdmin session in localStorage.
 */
export function SuperAdminGuard({ children }) {
  const location = useLocation();

  const token = localStorage.getItem('nexuspay_auth_token') || localStorage.getItem('auth_token');
  const role  = localStorage.getItem('nexuspay_active_role') || localStorage.getItem('user_role');

  const isAuthenticated = !!token && role === 'SuperAdmin';

  if (!isAuthenticated) {
    // Redirect to the super-admin login, preserving where they wanted to go
    return (
      <Navigate
        to="/super-admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

export default SuperAdminGuard;
