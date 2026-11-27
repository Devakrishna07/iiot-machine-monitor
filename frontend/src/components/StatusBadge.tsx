import React from 'react';

export type BadgeStatus = 'running' | 'idle' | 'fault';

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    running: {
      label: 'RUNNING',
      container: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
    },
    idle: {
      label: 'IDLE',
      container: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
    },
    fault: {
      label: 'FAULT',
      container: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      dot: 'bg-rose-500',
      ping: 'bg-rose-400',
    },
  }[status];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wider rounded-full border ${config.container} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.ping}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
};
