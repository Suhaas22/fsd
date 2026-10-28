import React from 'react';
import { WorkspaceSidebar } from '../workspace/WorkspaceSidebar';
export const SuperAdminSidebar = ({ isOpen, toggleSidebar }) => (
  <WorkspaceSidebar role="SuperAdmin" isOpen={isOpen} onClose={toggleSidebar} />
);
export default SuperAdminSidebar;
