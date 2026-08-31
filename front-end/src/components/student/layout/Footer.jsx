import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 lg:px-12 w-full gap-4">
        
        {/* Brand info */}
        <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-on-surface">
              NexusPay Learning
            </span>
          </Link>
          <span className="hidden md:inline text-outline text-xs">•</span>
          <p className="text-xs text-on-surface-variant font-medium">
            © 2024 NexusPay Learning Institute. Enterprise Grade Education & Verified Credentials.
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-semibold text-on-surface-variant">
          <Link to="/explore" className="hover:text-primary transition-colors">
            Browse
          </Link>
          <Link to="/my-learning" className="hover:text-primary transition-colors">
            My Learning
          </Link>
          <Link to="/certificates" className="hover:text-primary transition-colors">
            Certifications
          </Link>
          <Link to="/profile" className="hover:text-primary transition-colors">
            Profile & Settings
          </Link>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
            Terms
          </a>
          <a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">
            Help Center
          </a>
        </nav>

      </div>
    </footer>
  );
}
