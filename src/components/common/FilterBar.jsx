export default function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] || ''}
          onChange={(e) => onChange(f.key, e.target.value)}
          className="rounded-lg border border-ink-200/70 dark:border-ink-600 bg-white dark:bg-ink-800 px-3 py-2 text-sm text-ink-700 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
