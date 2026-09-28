import React from 'react';
import HumanAvatar from '../common/HumanAvatar';

export const UserAvatar = ({ name, role, src, size = 'md' }) => {
  const avatarSize = size === 'xl' ? '2xl' : size;

  return (
    <div className="flex items-center gap-3">
      <HumanAvatar name={name || 'User'} size={avatarSize} />
      {(name || role) && size !== 'sm' && (
        <div className="flex flex-col text-sm hidden sm:flex">
          {name && <span className="font-semibold text-slate-800">{name}</span>}
          {role && <span className="text-xs text-slate-500 font-medium">{role}</span>}
        </div>
      )}
    </div>
  );
};
