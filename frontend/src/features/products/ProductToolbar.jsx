import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Loader2, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

const ALL = 'all';

/**
 * Search + category + status, plus the result count. Purely presentational: it
 * owns no query state, it reports changes upward to the page container.
 *
 * @param {Object} props
 * @param {string} props.search
 * @param {(value: string) => void} props.onSearchChange
 * @param {string} props.category
 * @param {(value: string) => void} props.onCategoryChange
 * @param {'all'|import('@/types/product').StatusFilter} props.status
 * @param {(value: string) => void} props.onStatusChange
 * @param {string[]} [props.availableCategories]
 * @param {number} [props.resultCount] total matching rows, from the API's pagination
 * @param {boolean} [props.isSearching] a query is in flight
 */
export function ProductToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  availableCategories = [],
  resultCount,
  isSearching = false,
}) {
  const searchRef = useRef(null);

  // "/" focuses search, the way it does in Linear, Dub and GitHub -- but never
  // while the user is already typing somewhere else.
  useEffect(() => {
    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTyping) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-10 top-1/2 h-16 w-16 -translate-y-1/2 text-fog"
          aria-hidden="true"
        />
        <label htmlFor="product-search" className="sr-only">
          Search products by name
        </label>
        <input
          id="product-search"
          ref={searchRef}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products by name..."
          className="h-36 w-full rounded-inputs border border-midnight-ink bg-canvas-white pl-32 pr-40 text-sm text-charcoal transition-colors duration-150"
        />
        <span className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center gap-6">
          {isSearching ? (
            <Loader2 className="h-12 w-12 animate-spin text-fog" aria-hidden="true" />
          ) : null}
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="flex h-20 w-20 items-center justify-center rounded-full text-fog transition-colors duration-150 hover:bg-paper-mist hover:text-charcoal"
            >
              <X className="h-12 w-12" />
            </button>
          ) : (
            <KeyCap>/</KeyCap>
          )}
        </span>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 sm:w-[168px] sm:flex-none">
          <label htmlFor="category-filter" className="sr-only">
            Filter by category
          </label>
          <Select
            value={category || ALL}
            onValueChange={(value) => onCategoryChange(value === ALL ? '' : value)}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 sm:w-[168px] sm:flex-none">
          <label htmlFor="status-filter" className="sr-only">
            Filter by stock status
          </label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {typeof resultCount === 'number' ? (
        <span className="shrink-0 text-xs text-fog sm:pl-8" aria-live="polite">
          {formatNumber(resultCount)} {resultCount === 1 ? 'product' : 'products'}
        </span>
      ) : null}
    </div>
  );
}

ProductToolbar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  availableCategories: PropTypes.arrayOf(PropTypes.string),
  resultCount: PropTypes.number,
  isSearching: PropTypes.bool,
};

/** A tiny keyboard key cap, used for the "/" and "ESC" hints. */
export function KeyCap({ children }) {
  return (
    <kbd className="flex h-16 min-w-16 items-center justify-center rounded-inputs border border-ash bg-paper-mist px-4 font-inter text-micro font-medium text-fog">
      {children}
    </kbd>
  );
}

KeyCap.propTypes = { children: PropTypes.node.isRequired };
