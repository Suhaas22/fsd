import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Brand } from '../brand/Brand';
import '../../styles/auth.css';

export default function AuthLayout({ signup = false, children }) {
  return (
    <div className="academy-auth auth-page">
      <header className="auth-header">
        <Brand />
        <Link to={signup ? '/signin' : '/signup'} className="auth-header-link">
          {signup ? 'Sign in' : 'Create an account'}
          <ArrowRight size={16} />
        </Link>
      </header>

      <main className="auth-layout">
        <section className="auth-story" aria-labelledby="auth-story-title">
          <span className="auth-eyebrow">
            <Layers size={16} /> ACADEX
          </span>
          <h2 id="auth-story-title">
            {signup ? 'A new chapter.' : 'Back to your'}
            <br />
            <span>{signup ? 'Your next step.' : 'next chapter.'}</span>
          </h2>
          <p>
            {signup
              ? 'A place to learn, share what you know, and bring your teaching team together.'
              : 'Pick up where you left off. Your courses, teaching, and workspace are right here.'}
          </p>

          <div className="auth-book-scene" aria-hidden="true">
            <div className="auth-book-orbit" />
            <div className="auth-book">
              <BookOpen size={108} strokeWidth={1} />
            </div>
            <span className="auth-book-label">LEARN. CONNECT. GROW.</span>
          </div>

          <Link to="/" className="auth-story-link">
            Explore Acadex <ArrowRight size={16} />
          </Link>
        </section>

        <div className="auth-form-column">{children}</div>
      </main>

      <footer className="auth-footer">
        <Link to="/">
          <ArrowLeft size={14} /> Back to Acadex
        </Link>
        <span>Learning brings us together.</span>
      </footer>
    </div>
  );
}
