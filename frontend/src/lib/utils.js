import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names, with later Tailwind utilities winning over
 * earlier conflicting ones.
 *
 * @param {...(string|false|null|undefined|Record<string, boolean>|Array<unknown>)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const currencyWithPaiseFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

const compactFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/**
 * Formats a rupee amount without paise (table/KPI display).
 *
 * @param {number} value
 * @returns {string} e.g. "₹1,499"
 */
export function formatCurrency(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Formats a rupee amount including paise (detail views, where precision reads
 * as accuracy rather than noise).
 *
 * @param {number} value
 * @returns {string} e.g. "₹1,499.50"
 */
export function formatCurrencyPrecise(value) {
  return currencyWithPaiseFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * @param {number} value
 * @returns {string} e.g. "1,284"
 */
export function formatNumber(value) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Compacts large values so display-size numbers never wrap or overflow a tile.
 * Values below 10,000 stay fully written out, since "9,999" reads better than
 * "10K" at a glance.
 *
 * @param {number} value
 * @returns {string} e.g. "1,284" or "12.4K"
 */
export function formatCompact(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return safe < 10000 ? numberFormatter.format(safe) : compactFormatter.format(safe);
}

/**
 * @param {string} isoDate ISO 8601 timestamp
 * @returns {string} e.g. "6 Sep 2026"
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * @param {string} isoDate ISO 8601 timestamp
 * @returns {string} e.g. "6 Sep 2026, 2:45 pm"
 */
export function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
