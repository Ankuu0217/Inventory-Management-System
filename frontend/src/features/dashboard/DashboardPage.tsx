import { RotateCw } from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/api/dashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getErrorMessage } from '@/lib/apiError';

const CORE_STAT_CARD_COUNT = 4;

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useGetDashboardStatsQuery();

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
            Retry
          </Button>
        </Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Products" value={formatNumber(data.totalProducts)} />
            <StatCard label="Total Quantity" value={formatNumber(data.totalQuantity)} />
            <StatCard
              label="Low Stock"
              value={formatNumber(data.lowStockCount)}
              valueClassName="text-tangerine"
            />
            <StatCard
              label="Out of Stock"
              value={formatNumber(data.outOfStockCount)}
              valueClassName="text-graphite"
            />
          </div>

          <div className="flex flex-col gap-12">
            <p className="text-xs font-medium uppercase tracking-wide text-steel">More insights</p>
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mt-4 text-3xl font-semibold text-charcoal">
                    {formatCurrency(data.totalInventoryValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.categoryBreakdown.length === 0 ? (
                    <p className="mt-4 text-sm text-fog">No categories yet.</p>
                  ) : (
                    <ul className="mt-12 flex flex-col gap-8">
                      {data.categoryBreakdown.map((entry) => {
                        const maxCount = Math.max(
                          ...data.categoryBreakdown.map((item) => item.count),
                        );
                        const widthPercent = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
                        return (
                          <li key={entry.category} className="flex items-center gap-12">
                            <span className="flex-1 truncate text-sm text-charcoal">
                              {entry.category}
                            </span>
                            <span className="flex-[2] h-8 overflow-hidden rounded-full bg-paper-mist">
                              <span
                                className="block h-full rounded-full bg-electric-blue"
                                style={{ width: `${widthPercent}%` }}
                              />
                            </span>
                            <span className="shrink-0 text-right text-sm text-steel">
                              {entry.count}
                            </span>
                          </li>
                        );
                      })}
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

interface StatCardProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function StatCard({ label, value, valueClassName }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`mt-4 text-3xl font-semibold text-charcoal ${valueClassName ?? ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
