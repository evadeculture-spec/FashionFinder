import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Check, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info';
  action?: { label: string; to: string };
}

const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = (id: number) => setToasts((ts) => ts.filter((t) => t.id !== id));

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++seq.current;
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
    window.setTimeout(() => dismiss(id), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-8"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-card bg-ink px-4 py-3 text-sm text-ivory shadow-lift"
          >
            <span className={`grid size-6 shrink-0 place-items-center rounded-full ${t.tone === 'success' ? 'bg-success' : 'bg-white/15'}`}>
              {t.tone === 'success' ? <Check size={14} /> : <Info size={14} />}
            </span>
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <Link to={t.action.to} onClick={() => dismiss(t.id)} className="font-semibold text-clay-soft underline-offset-4 hover:underline">
                {t.action.label}
              </Link>
            )}
            <button aria-label="Fechar notificação" onClick={() => dismiss(t.id)} className="text-ivory/60 hover:text-ivory">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
