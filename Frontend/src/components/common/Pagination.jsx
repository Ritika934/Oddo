import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-ink-100 dark:border-ink-700 px-4 py-3">
      <span className="font-mono text-xs text-ink-500 dark:text-paper-200">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-md p-1.5 text-ink-600 dark:text-paper-200 hover:bg-ink-100 dark:hover:bg-ink-700 disabled:opacity-30"
        >
          <FiChevronLeft size={16} />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-md p-1.5 text-ink-600 dark:text-paper-200 hover:bg-ink-100 dark:hover:bg-ink-700 disabled:opacity-30"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
