import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div
      id="toast-notification"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white max-w-md transition-all animate-bounce-in"
      style={{
        borderColor: isSuccess ? '#10b981' : isError ? '#ef4444' : '#0284c7',
      }}
    >
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-600 shrink-0" />}
      
      <p className="text-sm font-medium text-slate-800 leading-snug">{toast.message}</p>
    </div>
  );
};
