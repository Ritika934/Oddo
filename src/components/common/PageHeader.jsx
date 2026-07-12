export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="font-mono text-xs tracking-widest text-signal">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900 dark:text-paper-50">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500 dark:text-paper-200">{description}</p>}
      </div>
      {action}
    </div>
  );
}
