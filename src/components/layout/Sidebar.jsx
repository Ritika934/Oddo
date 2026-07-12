import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiTruck, FiUsers, FiMap, FiTool, FiDroplet,
  FiCreditCard, FiBarChart2, FiMessageSquare, FiActivity,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid, roles: null },
  { to: '/vehicles', label: 'Vehicles', icon: FiTruck, roles: [ROLES.FLEET_MANAGER, ROLES.DISPATCHER] },
  { to: '/drivers', label: 'Drivers', icon: FiUsers, roles: [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.DISPATCHER] },
  { to: '/trips', label: 'Trips', icon: FiMap, roles: [ROLES.DISPATCHER, ROLES.FLEET_MANAGER] },
  { to: '/maintenance', label: 'Maintenance', icon: FiTool, roles: [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER] },
  { to: '/fuel', label: 'Fuel Logs', icon: FiDroplet, roles: [ROLES.FLEET_MANAGER, ROLES.FINANCE_ANALYST] },
  { to: '/expenses', label: 'Expenses', icon: FiCreditCard, roles: [ROLES.FINANCE_ANALYST, ROLES.FLEET_MANAGER] },
  { to: '/reports', label: 'Reports', icon: FiBarChart2, roles: null },
  { to: '/audit-logs', label: 'Audit Logs', icon: FiActivity, roles: [ROLES.FLEET_MANAGER] },
  { to: '/fleet-assistant', label: 'Fleet Assistant', icon: FiMessageSquare, roles: null },
];

export default function Sidebar({ mobileOpen, onNavigate }) {
  const { user } = useAuth();

  const items = NAV.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform border-r border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-850 transition-transform lg:static lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-ink-100 dark:border-ink-700 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 dark:bg-signal text-signal dark:text-ink-950 font-display font-bold">
          T
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-none text-ink-900 dark:text-paper-50">TransitOps</p>
          <p className="font-mono text-[10px] tracking-widest text-ink-400">FLEET CONTROL</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-ink-900 text-paper-50 dark:bg-signal/15 dark:text-signal'
                : 'text-ink-600 dark:text-paper-200 hover:bg-paper-100 dark:hover:bg-ink-700'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-signal transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                <item.icon size={17} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-ink-100 dark:border-ink-700 p-4">
        <div className="route-line text-ink-200 dark:text-ink-600 mb-3" />
        <p className="font-mono text-[10px] tracking-widest text-ink-400">MANIFEST v1.0</p>
      </div>
    </aside>
  );
}
