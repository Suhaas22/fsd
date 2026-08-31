import React from 'react';

export default function Badge({ children, variant = "primary", size = "md", className = "" }) {
  const variantStyles = {
    primary: "bg-primary-fixed text-primary font-semibold border-primary/20",
    secondary: "bg-secondary-fixed/50 text-on-secondary-container font-semibold border-secondary/20",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed font-semibold border-tertiary/20",
    surface: "bg-surface-container-high text-on-surface-variant font-medium border-outline-variant",
    accent: "bg-amber-100 text-amber-900 font-semibold border-amber-300",
    outline: "bg-transparent text-on-surface-variant border-outline-variant font-medium",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}
