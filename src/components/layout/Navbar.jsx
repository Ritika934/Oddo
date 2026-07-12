import { useState } from 'react';
import { FiMenu, FiSun, FiMoon, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 dark:border-ink-700 bg-white/80 dark:bg-ink-900/80 backdrop-blur px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-ink-600 dark:text-paper-200 hover:bg-paper-100 dark:hover:bg-ink-700 lg:hidden"
        >
          <FiMenu size={20} />
        </button>
        <div className="hidden lg:block">
          <p className="font-mono text-xs tracking-widest text-ink-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="rounded-md p-2 text-ink-600 dark:text-paper-200 hover:bg-paper-100 dark:hover:bg-ink-700 transition-colors"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-paper-100 dark:hover:bg-ink-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-transit/15 text-transit-dark dark:text-transit-light font-display text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-none text-ink-900 dark:text-paper-50">{user?.name}</p>
              <p className="font-mono text-[11px] text-ink-400">{ROLE_LABELS[user?.role]}</p>
            </div>
            <FiChevronDown size={14} className="text-ink-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-lg py-1">
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <FiLogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
