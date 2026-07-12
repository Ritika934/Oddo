const variants = {
  primary: 'bg-signal text-ink-950 hover:bg-signal-dark focus-visible:ring-signal',
  secondary: 'bg-transparent border border-ink-600/30 text-ink-900 dark:text-paper-100 hover:bg-ink-100/60 dark:hover:bg-ink-700/60 focus-visible:ring-transit',
  ghost: 'bg-transparent text-ink-900 dark:text-paper-100 hover:bg-ink-100 dark:hover:bg-ink-800 focus-visible:ring-transit',
  danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-50 dark:focus-visible:ring-offset-ink-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
