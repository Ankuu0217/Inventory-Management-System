import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package } from 'lucide-react';
import { cn, formatCompact } from '@/lib/utils';
import { useGetDashboardStatsQuery } from '@/api/dashboardApi';

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
    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto">
      <BrandBlock />

      <nav className="flex-1 px-12" aria-label="Primary">
        <ul className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-8 rounded-buttons px-8 py-6 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-sidebar-active text-charcoal'
                      : 'text-steel hover:bg-canvas-white hover:text-charcoal',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-16 w-16 shrink-0 transition-colors duration-150',
                        isActive ? 'text-electric-blue' : 'text-fog group-hover:text-steel',
                      )}
                      aria-hidden="true"
                    />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <StockHealthBlock />
    </div>
  );
}

Sidebar.propTypes = { onNavigate: PropTypes.func };

/** Logo mark + product name + subtitle. */
function BrandBlock() {
  return (
    <div className="flex items-center gap-8 px-20 py-20">
      <span
        className="flex h-32 w-32 shrink-0 items-center justify-center rounded-buttons bg-electric-blue text-canvas-white"
        aria-hidden="true"
      >
        <Package className="h-16 w-16" strokeWidth={2.25} />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold text-charcoal">Inventory</span>
        <span className="truncate text-xs text-fog">Stock control</span>
      </span>
    </div>
  );
}

/**
 * A compact status readout at the foot of the rail, in the pattern Dub uses
 * for usage meters. It reads the dashboard query that the Dashboard screen
 * already populates, so RTK Query serves it from cache -- no extra request,
 * no new endpoint, no data the app didn't already have.
 *
 * The meters show stock health rather than a bare count, so the filled
 * portion of each track always means something real.
 */
function StockHealthBlock() {
  const { data } = useGetDashboardStatsQuery();
  if (!data || !data.totalProducts) return null;

  const total = data.totalProducts;
  const needsAttention = (data.lowStockCount ?? 0) + (data.outOfStockCount ?? 0);
  const healthy = Math.max(0, total - needsAttention);

  return (
    <div className="mt-auto border-t border-ash px-20 py-16">
      <p className="mb-12 text-micro font-medium uppercase tracking-wide text-fog">Stock health</p>
      <div className="flex flex-col gap-12">
        <Meter
          label="In stock"
          value={`${formatCompact(healthy)}/${formatCompact(total)}`}
          percent={(healthy / total) * 100}
          fillClassName="bg-electric-blue"
          trackClassName="bg-sidebar-active"
        />
        <Meter
          label="Needs attention"
          value={`${formatCompact(needsAttention)}/${formatCompact(total)}`}
          percent={(needsAttention / total) * 100}
          fillClassName="bg-tangerine"
          trackClassName="bg-tangerine/15"
        />
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {number} props.percent
 * @param {string} props.fillClassName
 * @param {string} props.trackClassName the unfilled portion: a lighter step of the same hue
 */
function Meter({ label, value, percent, fillClassName, trackClassName }) {
  const width = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-8">
        <span className="text-xs text-steel">{label}</span>
        <span className="text-xs tabular-nums text-charcoal">{value}</span>
      </div>
      <span className={cn('block h-4 w-full overflow-hidden rounded-full', trackClassName)}>
        <span
          className={cn('block h-full rounded-full transition-[width] duration-150', fillClassName)}
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}

Meter.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  percent: PropTypes.number.isRequired,
  fillClassName: PropTypes.string.isRequired,
  trackClassName: PropTypes.string.isRequired,
};
