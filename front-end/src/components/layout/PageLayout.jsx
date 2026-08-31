import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ children, showNavbar = true, showFooter = true, className = "" }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {showNavbar && <Navbar />}
      <main className={`flex-1 w-full ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
