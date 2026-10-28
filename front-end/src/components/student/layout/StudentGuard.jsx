import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { StudentProvider } from '../../../context/StudentContext';

/**
 * StudentGuard
 * Route protection guard for the Student / Learner portal.
 * Redirects unauthenticated users attempting to open direct student URLs in Chrome
 * back to /signin?role=Student, preserving the intended destination in location state.
 * Wraps authenticated student views in the centralized StudentProvider Context.
 */
export function StudentGuard({ children }) {
  const location = useLocation();

  const rawToken =
    localStorage.getItem('nexuspay_auth_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('nexuspay_student_token');

  const token =
    rawToken &&
    rawToken !== 'null' &&
    rawToken !== 'undefined' &&
    typeof rawToken === 'string' &&
    rawToken.trim() !== ''
      ? rawToken
      : null;

  // If no auth token is found or token is invalid, redirect to Student sign-in
  if (!token) {
    return (
      <Navigate to="/signin?role=Student" state={{ from: location }} replace />
    );
  }

  return <StudentProvider>{children}</StudentProvider>;
}

export default StudentGuard;
