import { cn } from "../../../utils/cn";

export function Badge({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}) {
  const variants = {
    default: "bg-navy-100 text-navy-800",
    primary: "bg-primary-50 text-primary-700 ring-1 ring-primary-600/10",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
