import React, { useState } from 'react';
import StudentTopbar, { StudentSidebar } from './Navbar';

export default function PageLayout({ children, className = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="academy-portal learner-workspace min-h-screen flex bg-[#F8FAFC] text-slate-900 antialiased font-sans">
      <StudentSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <StudentTopbar onMenuClick={() => setMenuOpen(true)} />
        <main className={`flex-1 w-full ${className}`}>{children}</main>
      </div>
    </div>
  );
}
