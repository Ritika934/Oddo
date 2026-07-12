import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-ink-200/60 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-700 px-5 py-4">
          <h3 className="font-display font-semibold text-ink-900 dark:text-paper-50">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 dark:border-ink-700 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
