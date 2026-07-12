import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative w-full max-w-xs">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200/70 dark:border-ink-600 bg-white dark:bg-ink-800 py-2 pl-9 pr-3 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
      />
    </div>
  );
}
