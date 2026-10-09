import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ children, showNavbar = true, showFooter = true, className = "" }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      {showNavbar && <Navbar />}
      <main className={`flex-1 w-full ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
