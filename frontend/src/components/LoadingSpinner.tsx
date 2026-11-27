import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading telemetry data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
