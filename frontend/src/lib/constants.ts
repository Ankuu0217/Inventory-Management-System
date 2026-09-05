import type { StockStatus } from '@/types/product';

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  'In Stock': 'In Stock',
  'Low Stock': 'Low Stock',
  'Out of Stock': 'Out of Stock',
};

export const STOCK_STATUS_STYLES: Record<StockStatus, { bg: string; text: string; dot: string }> = {
  'In Stock': { bg: 'bg-soft-mint', text: 'text-vivid-green', dot: 'bg-vivid-green' },
  'Low Stock': { bg: 'bg-tangerine/15', text: 'text-tangerine', dot: 'bg-tangerine' },
  'Out of Stock': { bg: 'bg-paper-mist', text: 'text-steel', dot: 'bg-steel' },
};

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'inStock', label: 'In Stock' },
  { value: 'lowStock', label: 'Low Stock' },
  { value: 'outOfStock', label: 'Out of Stock' },
] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const DEFAULT_PAGE_SIZE = 10;

export const SEARCH_DEBOUNCE_MS = 300;
