import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Failed to connect to monitoring service</h4>
          <p className="text-xs text-rose-400 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
