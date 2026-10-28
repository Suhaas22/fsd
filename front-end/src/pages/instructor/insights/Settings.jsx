import React from 'react';
import { Navigate } from 'react-router-dom';
export const Settings = () => (
  <Navigate to="/instructor/profile?tab=settings" replace />
);
