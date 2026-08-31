import { cn } from "../../../utils/cn";

export function Button({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600 shadow-sm hover:shadow",
    secondary: "bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 hover:border-navy-300 focus:ring-navy-200 shadow-sm",
    outline: "border border-navy-200 text-navy-700 hover:bg-navy-50 hover:border-navy-300 focus:ring-navy-200",
    ghost: "text-navy-600 hover:bg-navy-100 hover:text-navy-900 focus:ring-navy-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
