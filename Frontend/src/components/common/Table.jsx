export default function Table({ columns, data, emptyLabel = 'No records yet' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="route-line w-16 text-ink-300 dark:text-ink-600" />
        <p className="text-sm text-ink-500 dark:text-paper-200">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-100 dark:border-ink-700 text-left">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-500 dark:text-paper-200">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-ink-50 dark:border-ink-700/60 hover:bg-paper-50 dark:hover:bg-ink-700/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-ink-800 dark:text-paper-100">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
