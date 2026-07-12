export default function Card({ children, className = '', as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={`rounded-xl border border-ink-200/60 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
