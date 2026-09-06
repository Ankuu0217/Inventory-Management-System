import PropTypes from 'prop-types';
import { RotateCw } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/api/dashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getErrorMessage } from '@/lib/apiError';

const CORE_STAT_CARD_COUNT = 4;

/** Container: every number here comes from GET /api/dashboard, never the client. */
export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useGetDashboardStatsQuery();
  const categoryBreakdown = Array.isArray(data?.categoryBreakdown) ? data.categoryBreakdown : [];

  return (
    <div className="flex flex-col gap-32">
      <h1 className="text-heading-sm font-semibold text-charcoal md:text-heading">Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: CORE_STAT_CARD_COUNT }).map((_, index) => (
            <Card key={index} className="flex flex-col gap-16">
              <Skeleton className="h-16 w-64" />
              <Skeleton className="h-32 w-48" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="flex flex-col items-start gap-12">
          <p className="text-sm text-charcoal">{getErrorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RotateCw className="h-16 w-16" />
            Try again
          </Button>
        </Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total products" value={formatNumber(data.totalProducts)} />
            <StatCard label="Total units in stock" value={formatNumber(data.totalQuantity)} />
            <StatCard label="Low stock" value={formatNumber(data.lowStockCount)} />
            <StatCard label="Out of stock" value={formatNumber(data.outOfStockCount)} />
          </div>

          <div className="flex flex-col gap-12">
            <p className="text-xs font-medium text-steel">More insights</p>
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mt-4 text-3xl font-semibold text-charcoal">
                    {formatCurrency(data.totalInventoryValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Products by category</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryBreakdown.length === 0 ? (
                    <p className="mt-4 text-sm text-fog">No categories yet.</p>
                  ) : (
                    <ul className="mt-12 flex flex-col gap-8">
                      {categoryBreakdown.map((entry) => (
                        <li key={entry.category} className="flex items-center gap-12">
                          <span className="flex-1 truncate text-sm text-charcoal">
                            {entry.category}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums text-steel">
                            {entry.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 */
function StatCard({ label, value }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mt-4 text-3xl font-semibold text-charcoal">{value}</p>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired };
