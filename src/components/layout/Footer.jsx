export default function Footer() {
  return (
    <footer className="border-t border-ink-100 dark:border-ink-700 px-6 py-4 text-center font-mono text-[11px] text-ink-400">
      TransitOps · Fleet Operations Platform · {new Date().getFullYear()}
    </footer>
  );
}
