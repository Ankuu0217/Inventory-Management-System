import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { PAGE_SIZE_OPTIONS } from '@/lib/constants';

/**
 * Builds a compact page list, collapsing long runs so the control never wraps:
 * 1 … 4 5 6 … 20
 *
 * @param {number} page
 * @param {number} totalPages
 * @returns {Array<number|'gap'>}
 */
function buildPageList(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const visible = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  /** @type {Array<number|'gap'>} */
  const withGaps = [];
  visible.forEach((n, index) => {
    if (index > 0 && n - visible[index - 1] > 1) withGaps.push('gap');
    withGaps.push(n);
  });
  return withGaps;
}

/**
 * @param {Object} props
 * @param {import('@/types/product').Pagination} props.pagination
 * @param {boolean} [props.isFetching]
 * @param {(page: number) => void} props.onPageChange
 * @param {(limit: number) => void} props.onLimitChange
 */
export function ProductPagination({ pagination, isFetching = false, onPageChange, onLimitChange }) {
  const { page, limit, total, totalPages } = pagination;
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const pages = buildPageList(page, Math.max(totalPages, 1));

  return (
    <div className="flex flex-col items-center justify-between gap-16 sm:flex-row">
      <p className="text-xs text-fog">
        Showing <span className="tabular-nums text-steel">{formatNumber(first)}</span>–
        <span className="tabular-nums text-steel">{formatNumber(last)}</span> of{' '}
        <span className="tabular-nums text-steel">{formatNumber(total)}</span>
      </p>

      <div className="flex items-center gap-8">
        <label htmlFor="page-size" className="sr-only">
          Rows per page
        </label>
        <select
          id="page-size"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-32 rounded-inputs border border-ash bg-canvas-white px-8 text-xs text-steel transition-colors duration-150 hover:bg-paper-mist"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>

        <nav className="flex items-center gap-4" aria-label="Pagination">
          <PageButton
            aria-label="Previous page"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isFetching}
          >
            <ChevronLeft className="h-12 w-12" />
          </PageButton>

          {pages.map((entry, index) =>
            entry === 'gap' ? (
              // eslint-disable-next-line react/no-array-index-key
              <span key={`gap-${index}`} className="px-4 text-xs text-fog">
                …
              </span>
            ) : (
              <PageButton
                key={entry}
                onClick={() => onPageChange(entry)}
                disabled={isFetching}
                isActive={entry === page}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? 'page' : undefined}
              >
                {entry}
              </PageButton>
            ),
          )}

          <PageButton
            aria-label="Next page"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isFetching}
          >
            <ChevronRight className="h-12 w-12" />
          </PageButton>
        </nav>
      </div>
    </div>
  );
}

ProductPagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  isFetching: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
};

/** @param {{isActive?: boolean, children: React.ReactNode}} props */
function PageButton({ isActive = false, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-32 min-w-32 items-center justify-center rounded-buttons px-8 text-xs tabular-nums transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'bg-charcoal font-medium text-canvas-white'
          : 'border border-ash bg-canvas-white text-steel hover:bg-paper-mist hover:text-charcoal',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

PageButton.propTypes = { isActive: PropTypes.bool, children: PropTypes.node.isRequired };
