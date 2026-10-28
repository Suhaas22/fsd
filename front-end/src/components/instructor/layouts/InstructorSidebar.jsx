import React from 'react';
import { WorkspaceSidebar } from '../../workspace/WorkspaceSidebar';
export const InstructorSidebar = ({ isOpen, toggleSidebar }) => (
  <WorkspaceSidebar role="Instructor" isOpen={isOpen} onClose={toggleSidebar} />
);
export default InstructorSidebar;
