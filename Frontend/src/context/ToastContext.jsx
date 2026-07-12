import { createContext, useCallback, useContext, useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

const icons = {
  success: <FiCheckCircle className="text-success" size={18} />,
  error: <FiAlertTriangle className="text-danger" size={18} />,
  info: <FiInfo className="text-transit" size={18} />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-lg border border-ink-200/60 dark:border-ink-700 bg-white dark:bg-ink-800 px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in"
          >
            {icons[t.type]}
            <span className="text-sm text-ink-800 dark:text-paper-100">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 text-ink-400 hover:text-ink-600">
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
