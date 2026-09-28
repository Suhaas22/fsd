import React from 'react';

// Generates clean, human-designed initials and deterministic Coursera-style bright palette
const PALETTES = [
  { bg: 'bg-[#0056D2]', text: 'text-white' }, // Coursera signature bright blue
  { bg: 'bg-[#0F766E]', text: 'text-white' }, // Deep teal
  { bg: 'bg-[#4338CA]', text: 'text-white' }, // Indigo
  { bg: 'bg-[#047857]', text: 'text-white' }, // Emerald
  { bg: 'bg-[#B45309]', text: 'text-white' }, // Amber
  { bg: 'bg-[#6D28D9]', text: 'text-white' }, // Purple
  { bg: 'bg-[#1D4ED8]', text: 'text-white' }, // Royal Blue
  { bg: 'bg-[#BE123C]', text: 'text-white' }, // Crimson
];

function getInitials(name) {
  if (!name) return 'U';
  const clean = name.replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name) {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px] rounded-lg',
  sm: 'w-8 h-8 text-xs rounded-xl',
  md: 'w-10 h-10 text-xs font-bold rounded-xl',
  lg: 'w-12 h-12 text-sm font-bold rounded-2xl',
  xl: 'w-16 h-16 text-base font-black rounded-2xl',
  '2xl': 'w-20 h-20 text-xl font-black rounded-2xl',
};

export default function HumanAvatar({ name, size = 'md', className = '' }) {
  const initials = getInitials(name);
  const palette = getPalette(name);
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div
      className={`inline-flex items-center justify-center font-bold select-none shrink-0 shadow-xs border border-white/20 tracking-wider ${palette.bg} ${palette.text} ${sizeClass} ${className}`}
      title={name || 'User Profile'}
    >
      {initials}
    </div>
  );
}
