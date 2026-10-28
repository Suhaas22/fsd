import React from 'react';
import { WorkspaceSidebar } from '../workspace/WorkspaceSidebar';
export default function OrgSidebar({ isOpen, onClose }) {
  return (
    <WorkspaceSidebar
      role="Organization"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
