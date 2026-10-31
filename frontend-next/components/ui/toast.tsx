'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((options: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto p-4 rounded-[4px] border shadow-2xl flex items-start gap-3 bg-[#0F1218] transition-all animate-in slide-in-from-bottom-5',
              t.type === 'error'
                ? 'border-[#991B1B]/60 text-red-400'
                : t.type === 'info'
                ? 'border-[rgba(197,160,89,0.3)] text-[#C5A059]'
                : 'border-[rgba(197,160,89,0.4)] text-[#E9E2D3]'
            )}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : t.type === 'info' ? (
              <Info className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h5 className="font-serif-formal text-xs font-bold tracking-wider text-[#D8B26E] uppercase">
                {t.title}
              </h5>
              {t.description && (
                <p className="text-[0.6875rem] text-[#858995] mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-[#858995] hover:text-[#E9E2D3] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
