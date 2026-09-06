/**
 * Visual treatment for each stock status. Tints only -- text always carries
 * the label too, so colour is never the sole signal.
 *
 * @type {Record<import('@/types/product').StockStatus, {bg: string, text: string, dot: string}>}
 */
export const STOCK_STATUS_STYLES = {
  'In Stock': { bg: 'bg-soft-mint', text: 'text-forest', dot: 'bg-vivid-green' },
  'Low Stock': { bg: 'bg-tangerine/12', text: 'text-rust', dot: 'bg-tangerine' },
  'Out of Stock': { bg: 'bg-paper-mist', text: 'text-steel', dot: 'bg-silver' },
};

/** Options for the stock-status filter select. */
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'inStock', label: 'In Stock' },
  { value: 'lowStock', label: 'Low Stock' },
  { value: 'outOfStock', label: 'Out of Stock' },
];

/** Human-readable labels for a `StatusFilter` key, used by the filter chips. */
export const STATUS_FILTER_LABELS = {
  inStock: 'In Stock',
  lowStock: 'Low Stock',
  outOfStock: 'Out of Stock',
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const DEFAULT_PAGE_SIZE = 10;

export const SEARCH_DEBOUNCE_MS = 300;

/** Categories beyond this count fold into a single "Other" row on the dashboard. */
export const CATEGORY_BREAKDOWN_LIMIT = 6;

/**
 * Quantity thresholds, mirrored from the backend purely so the product form can
 * preview which badge a row will get. The API remains the source of truth --
 * every rendered badge uses the `stockStatus` the server returned.
 */
export const STOCK_THRESHOLDS = { LOW_STOCK_MAX: 10 };

/**
 * Derives the badge a given quantity will produce, for the form's live preview.
 *
 * @param {number} quantity
 * @returns {import('@/types/product').StockStatus}
 */
export function previewStockStatus(quantity) {
  if (!Number.isFinite(quantity) || quantity <= 0) return 'Out of Stock';
  if (quantity <= STOCK_THRESHOLDS.LOW_STOCK_MAX) return 'Low Stock';
  return 'In Stock';
}
