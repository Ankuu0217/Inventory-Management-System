import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { STOCK_STATUS_STYLES } from '@/lib/constants';

/**
 * Renders the status the API returned -- never derived from quantity here, so
 * the backend stays the single source of truth for that rule. Always pairs the
 * dot with its label, so colour is never the only signal.
 *
 * @param {Object} props
 * @param {import('@/types/product').StockStatus} props.status
 * @param {string} [props.className]
 */
export function StockStatusBadge({ status, className }) {
  const styles = STOCK_STATUS_STYLES[status] ?? STOCK_STATUS_STYLES['Out of Stock'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-6 whitespace-nowrap rounded-full px-10 py-6 text-xs font-medium leading-none',
        styles.bg,
        styles.text,
        className,
      )}
    >
      <span className={cn('h-6 w-6 shrink-0 rounded-full', styles.dot)} aria-hidden="true" />
      {status}
    </span>
  );
}

StockStatusBadge.propTypes = {
  status: PropTypes.oneOf(['In Stock', 'Low Stock', 'Out of Stock']).isRequired,
  className: PropTypes.string,
};
