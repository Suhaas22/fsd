import { forwardRef, useState, createContext, useContext } from 'react';
import { cn } from '../../../utils/cn';

const TabsContext = createContext();

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ value: activeValue, onValueChange: handleValueChange }}
    >
      <div
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-600 border border-slate-200/60 shadow-2xs',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef(({ className, value, ...props }, ref) => {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-white text-[#0056D2] shadow-xs ring-1 ring-slate-200/80'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef(({ className, value, ...props }, ref) => {
  const { value: activeValue } = useContext(TabsContext);

  if (activeValue !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        'mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';
