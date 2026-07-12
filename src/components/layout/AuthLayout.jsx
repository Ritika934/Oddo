import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-paper-50 dark:bg-ink-900">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink-950 p-10 text-paper-50">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 28px)',
        }} />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-signal text-ink-950 font-display font-bold">T</div>
          <span className="font-display font-bold">TransitOps</span>
        </div>

        <div className="relative">
          <p className="font-mono text-xs tracking-widest text-signal">ROUTE MANIFEST</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            Every vehicle,<br />every driver,<br />one dispatch board.
          </h1>
          <div className="mt-8 flex items-center gap-3 text-sm text-paper-200/70">
            <span className="h-2 w-2 rounded-full bg-success" />
            Live status across the fleet
          </div>
          <div className="mt-6 route-line w-full text-ink-600" />
        </div>

        <p className="relative font-mono text-[11px] text-paper-200/50">
          Fleet Manager · Dispatcher · Safety Officer · Finance Analyst
        </p>
      </div>

      <div className="relative flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <button
          onClick={toggleTheme}
          className="absolute right-6 top-6 rounded-md p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <div className="mx-auto w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
