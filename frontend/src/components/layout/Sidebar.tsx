import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
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
                  'flex items-center gap-12 rounded-buttons px-12 py-8 text-sm font-medium text-charcoal transition-colors hover:bg-sidebar-active/60',
                  isActive && 'bg-sidebar-active text-deep-sapphire',
                )
              }
            >
              <Icon className="h-20 w-20" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
