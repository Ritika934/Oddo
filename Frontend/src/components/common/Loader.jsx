export default function Loader({ label = 'Loading', size = 'md' }) {
  const dims = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-ink-500 dark:text-paper-200">
      <span
        className={`${dims[size]} animate-spin rounded-full border-2 border-current border-t-transparent text-signal`}
        role="status"
      />
      {label && <span className="text-sm font-mono">{label}…</span>}
    </div>
  );
}
