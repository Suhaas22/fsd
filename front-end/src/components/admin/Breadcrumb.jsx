import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-sm text-slate-500 font-medium">
      <Link to="/admin/dashboard" className="hover:text-primary transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        // Skip the 'admin' part in breadcrumbs if we want, or keep it.
        // Let's keep it but format nicely.
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        // Format the string (capitalize first letter)
        const title = value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
            {isLast ? (
              <span className="text-slate-800">{title}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
