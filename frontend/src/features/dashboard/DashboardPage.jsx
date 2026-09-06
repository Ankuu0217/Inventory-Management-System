import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCw, Package } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/api/dashboardApi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn, formatCompact, formatCurrency, formatNumber } from '@/lib/utils';
import { getErrorMessage } from '@/lib/apiError';
import { CATEGORY_BREAKDOWN_LIMIT } from '@/lib/constants';

/**
 * Container: every number on this screen comes from GET /api/dashboard.
 * Nothing here is derived from a product list on the client.
 */
export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useGetDashboardStatsQuery();

  return (
    <div className="flex flex-col gap-24">
      <PageHeader title="Dashboard" subtitle="Stock levels across your catalogue at a glance." />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <Card className="flex flex-col items-start gap-12">
          <p className="text-sm text-charcoal">{getErrorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RotateCw />
            Try again
          </Button>
        </Card>
      ) : data && data.totalProducts === 0 ? (
        <Card className="flex flex-col items-center gap-12 rounded-largecards py-48 text-center">
          <Package className="h-40 w-40 text-silver" aria-hidden="true" />
          <p className="text-base font-medium text-charcoal">Nothing to report yet</p>
          <p className="max-w-[380px] text-sm text-steel">
            Once you add products, their stock levels will be summarised here.
          </p>
          <Button variant="primary" asChild>
            <Link to="/products">Go to products</Link>
          </Button>
        </Card>
      ) : data ? (
        <DashboardContent data={data} />
      ) : null}
    </div>
  );
}

/** @param {{data: import('@/types/product').DashboardStats}} props */
function DashboardContent({ data }) {
  const breakdown = Array.isArray(data.categoryBreakdown) ? data.categoryBreakdown : [];
  const avgUnits = data.totalProducts > 0 ? data.totalQuantity / data.totalProducts : 0;

  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total products" value={data.totalProducts} dotClassName="bg-electric-blue" />
        <StatTile
          label="Total units in stock"
          value={data.totalQuantity}
          dotClassName="bg-vivid-green"
        />
        <StatTile
          label="Low stock"
          value={data.lowStockCount}
          dotClassName="bg-tangerine"
          to="/products?status=lowStock"
        />
        <StatTile
          label="Out of stock"
          value={data.outOfStockCount}
          dotClassName="bg-fog"
          to="/products?status=outOfStock"
        />
      </div>

      <Card className="grid grid-cols-1 gap-16 sm:grid-cols-3">
        <SecondaryMetric label="Inventory value" value={formatCurrency(data.totalInventoryValue)} />
        <SecondaryMetric label="Categories" value={formatNumber(breakdown.length)} />
        <SecondaryMetric
          label="Avg. units per product"
          value={avgUnits.toFixed(avgUnits < 10 ? 1 : 0)}
        />
      </Card>

      <CategoryBreakdown entries={breakdown} />
    </div>
  );
}

DashboardContent.propTypes = { data: PropTypes.object.isRequired };

/**
 * A headline number. The dot beside the label carries the metric's identity --
 * the value itself is always ink, because a number rendered in orange reads as
 * an error state rather than a measurement.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {string} props.dotClassName
 * @param {string} [props.to] makes the tile a link into the matching filter
 */
function StatTile({ label, value, dotClassName, to }) {
  const body = (
    <>
      <span className="flex items-center gap-6">
        <span className={cn('h-6 w-6 shrink-0 rounded-full', dotClassName)} aria-hidden="true" />
        <span className="text-sm font-medium text-steel">{label}</span>
        {to ? (
          <ArrowRight
            className="ml-auto h-12 w-12 text-fog opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            aria-hidden="true"
          />
        ) : null}
      </span>
      <span className="mt-8 block text-3xl font-semibold text-charcoal">
        {formatCompact(value)}
      </span>
    </>
  );

  const shared = 'rounded-cards border border-ash bg-canvas-white p-16 text-left';

  if (!to) {
    return <div className={shared}>{body}</div>;
  }

  return (
    <Link
      to={to}
      className={cn(
        shared,
        'group block cursor-pointer transition-colors duration-150 hover:bg-paper-mist',
      )}
    >
      {body}
    </Link>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  dotClassName: PropTypes.string.isRequired,
  to: PropTypes.string,
};

/** @param {{label: string, value: string}} props */
function SecondaryMetric({ label, value }) {
  return (
    <div>
      <p className="text-micro font-medium uppercase tracking-wide text-fog">{label}</p>
      <p className="mt-4 text-base font-medium tabular-nums text-charcoal">{value}</p>
    </div>
  );
}

SecondaryMetric.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

/**
 * Bar-in-row magnitude comparison. One hue only: length encodes the value, so
 * a second colour would be decoration pretending to be data. No legend (single
 * series), no axis, no chart library.
 *
 * @param {{entries: import('@/types/product').CategoryBreakdownEntry[]}} props
 */
function CategoryBreakdown({ entries }) {
  if (entries.length === 0) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-charcoal">Products by category</h2>
        <p className="mt-12 text-sm text-steel">No categories yet.</p>
      </Card>
    );
  }

  const sorted = [...entries].sort((a, b) => b.count - a.count);
  const head = sorted.slice(0, CATEGORY_BREAKDOWN_LIMIT);
  const tail = sorted.slice(CATEGORY_BREAKDOWN_LIMIT);
  const rows =
    tail.length > 0
      ? [...head, { category: 'Other', count: tail.reduce((sum, item) => sum + item.count, 0) }]
      : head;
  const maxCount = Math.max(...rows.map((row) => row.count), 1);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-16">
        <h2 className="text-base font-semibold text-charcoal">Products by category</h2>
        <span className="text-micro font-medium uppercase tracking-wide text-fog">Products</span>
      </div>

      <ul className="mt-12 flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.category} className="relative flex items-center justify-between px-8 py-4">
            <span
              className="absolute inset-y-0 left-0 rounded-r-inputs bg-electric-blue/10"
              style={{ width: `${(row.count / maxCount) * 100}%` }}
              aria-hidden="true"
            />
            <span className="relative truncate text-sm text-charcoal">{row.category}</span>
            <span className="relative pl-16 text-sm tabular-nums text-charcoal">{row.count}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

CategoryBreakdown.propTypes = { entries: PropTypes.array.isRequired };

/** Mirrors the real layout so nothing shifts when the data lands. */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <Skeleton className="h-12 w-[120px] rounded-full" />
            <Skeleton className="mt-12 h-32 w-[72px] rounded-inputs" />
          </Card>
        ))}
      </div>
      <Card className="grid grid-cols-1 gap-16 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-10 w-[100px] rounded-full" />
            <Skeleton className="mt-8 h-16 w-[80px] rounded-inputs" />
          </div>
        ))}
      </Card>
      <Card>
        <Skeleton className="h-16 w-[160px] rounded-inputs" />
        <div className="mt-16 flex flex-col gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-inputs" />
          ))}
        </div>
      </Card>
    </div>
  );
}
