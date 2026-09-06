import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
];

/**
 * Primary navigation. Rendered both in the fixed desktop rail and inside the
 * mobile drawer, so it takes an `onNavigate` callback to dismiss the drawer.
 *
 * @param {Object} props
 * @param {() => void} [props.onNavigate]
 */
export function Sidebar({ onNavigate }) {
  return (
    <nav className="flex h-full flex-col gap-24 p-16" aria-label="Primary">
      <div className="px-8 py-8 text-lg font-semibold text-charcoal">Inventory</div>
      <ul className="flex flex-col gap-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-12 rounded-buttons px-12 py-8 text-sm font-medium text-steel transition-colors hover:bg-canvas-white',
                  isActive && 'bg-sidebar-active text-charcoal',
                )
              }
            >
              <Icon className="h-16 w-16" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

Sidebar.propTypes = { onNavigate: PropTypes.func };
