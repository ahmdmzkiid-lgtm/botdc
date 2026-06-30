import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ToastData {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastId = 0;
let addToastFn: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export function toast(type: ToastData['type'], message: string) {
  addToastFn?.({ type, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((t: Omit<ToastData, 'id'>) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const remove = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const colors: Record<string, string> = {
    success: 'bg-green-600/90 border-green-500/30',
    error: 'bg-red-600/90 border-red-500/30',
    info: 'bg-blue-600/90 border-blue-500/30',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colors[t.type]} text-white px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[320px] backdrop-blur-xl`}
        >
          <span className="flex-1 text-sm">{t.message}</span>
          <button onClick={() => remove(t.id)} className="text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
