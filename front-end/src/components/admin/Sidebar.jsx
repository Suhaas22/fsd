import React from 'react';
import { WorkspaceSidebar } from '../workspace/WorkspaceSidebar';
export const Sidebar = ({ isOpen, toggleSidebar }) => (
  <WorkspaceSidebar
    role="Admin"
    isOpen={isOpen}
    onClose={toggleSidebar}
  />
);
export default Sidebar;
