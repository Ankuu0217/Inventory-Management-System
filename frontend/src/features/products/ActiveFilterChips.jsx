import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { KeyCap } from '@/features/products/ProductToolbar';
import { STATUS_FILTER_LABELS } from '@/lib/constants';

/**
 * One dismissable pill per active filter, with a "Clear all" affordance that
 * advertises its own keyboard shortcut. Renders nothing when no filter is on,
 * so the row costs no vertical space in the default state.
 *
 * @param {Object} props
 * @param {string} props.search
 * @param {string} props.category
 * @param {'all'|import('@/types/product').StatusFilter} props.status
 * @param {(key: 'search'|'category'|'status') => void} props.onClear
 * @param {() => void} props.onClearAll
 */
export function ActiveFilterChips({ search, category, status, onClear, onClearAll }) {
  const chips = [];
  if (search) chips.push({ key: 'search', label: 'Search', value: `"${search}"` });
  if (category) chips.push({ key: 'category', label: 'Category', value: category });
  if (status && status !== 'all') {
    chips.push({ key: 'status', label: 'Status', value: STATUS_FILTER_LABELS[status] ?? status });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-8">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-6 rounded-full bg-paper-mist py-4 pl-10 pr-4 text-xs text-charcoal"
        >
          <span className="text-fog">{chip.label}:</span>
          <span className="max-w-[180px] truncate font-medium">{chip.value}</span>
          <button
            type="button"
            onClick={() => onClear(chip.key)}
            aria-label={`Clear ${chip.label.toLowerCase()} filter`}
            className="flex h-16 w-16 items-center justify-center rounded-full text-fog transition-colors duration-150 hover:bg-ash hover:text-charcoal"
          >
            <X className="h-10 w-10" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="ml-auto inline-flex items-center gap-6 rounded-buttons px-6 py-4 text-xs text-steel transition-colors duration-150 hover:text-charcoal"
      >
        Clear all
        <KeyCap>ESC</KeyCap>
      </button>
    </div>
  );
}

ActiveFilterChips.propTypes = {
  search: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onClear: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
};
