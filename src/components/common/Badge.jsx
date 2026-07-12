const tones = {
  success: 'bg-success/15 text-success border-success/30',
  warn: 'bg-signal/15 text-signal-dark dark:text-signal border-signal/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  info: 'bg-transit/15 text-transit-dark dark:text-transit-light border-transit/30',
  neutral: 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-paper-200 border-ink-200 dark:border-ink-600',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
