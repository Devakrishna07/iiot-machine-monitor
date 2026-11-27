import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white',
    success: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    warning: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
    danger: 'border-rose-500/30 text-rose-600 dark:text-rose-400',
  }[variant];

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md ${variantStyles}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {title}
        </p>
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</span>
        {subtitle && (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
