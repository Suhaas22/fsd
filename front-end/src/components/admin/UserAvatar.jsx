import React from 'react';
import clsx from 'clsx';

export const UserAvatar = ({ name, role, src, size = 'md' }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
    
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={clsx(
        "rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20",
        sizeClasses[size]
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {(name || role) && size !== 'sm' && (
        <div className="flex flex-col text-sm hidden sm:flex">
          {name && <span className="font-semibold text-slate-800">{name}</span>}
          {role && <span className="text-xs text-slate-500 font-medium">{role}</span>}
        </div>
      )}
    </div>
  );
};
