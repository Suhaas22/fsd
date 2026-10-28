import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, BookOpen, Sparkles } from 'lucide-react';
export function Brand() {
  return (
    <Link
      to="/"
      aria-label="Acadex home"
      className="academy-brand"
    >
      <span>
        <Layers size={23} />
      </span>
      <strong>
        acadex<small>LEARN. CONNECT. GROW.</small>
      </strong>
    </Link>
  );
}
export function LearningVisual({ compact = false }) {
  return (
    <div
      className={`learning-visual ${compact ? 'is-compact' : ''}`}
      role="img"
      aria-label="An illustrated book surrounded by notes about learning"
    >
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <span className="visual-dot dot-one" />
      <span className="visual-dot dot-two" />
      <div className="visual-book">
        <BookOpen
          size={95}
          strokeWidth={1}
        />
        <span>YOUR NEXT CHAPTER</span>
      </div>
      <div className="visual-note note-one">
        <span>
          <Sparkles size={21} />
        </span>
        <div>
          <strong>Make room for growth.</strong>
          <small>One lesson at a time.</small>
        </div>
      </div>
      <div className="visual-note note-two">
        <BookOpen size={22} />
        <div>
          <strong>Build something meaningful.</strong>
          <small>Learn it. Try it. Make it yours.</small>
        </div>
      </div>
      <span className="visual-caption">CURIOSITY LOOKS GOOD ON YOU.</span>
    </div>
  );
}
