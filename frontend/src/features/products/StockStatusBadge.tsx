import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STOCK_STATUS_STYLES } from '@/lib/constants';
import type { StockStatus } from '@/types/product';

interface StockStatusBadgeProps {
  status: StockStatus;
}

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const styles = STOCK_STATUS_STYLES[status];

  return (
    <Badge className={cn(styles.bg, styles.text)}>
      <span className={cn('h-8 w-8 rounded-full', styles.dot)} aria-hidden="true" />
      {status}
    </Badge>
  );
}
