import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_FILTER_OPTIONS } from '@/lib/constants';

const ALL = 'all';

/**
 * Search + category + status filters. Purely presentational: it owns no query
 * state, it just reports changes upward to the page container.
 *
 * @param {Object} props
 * @param {string} props.search
 * @param {(value: string) => void} props.onSearchChange
 * @param {string} props.category
 * @param {(value: string) => void} props.onCategoryChange
 * @param {'all'|import('@/types/product').StatusFilter} props.status
 * @param {(value: string) => void} props.onStatusChange
 * @param {string[]} [props.availableCategories]
 */
export function ProductToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  availableCategories = [],
}) {
  return (
    <div className="flex flex-col gap-12 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-12 top-1/2 h-16 w-16 -translate-y-1/2 text-fog"
          aria-hidden="true"
        />
        <label htmlFor="product-search" className="sr-only">
          Search products by name
        </label>
        <Input
          id="product-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products by name..."
          className="pl-32"
        />
      </div>

      <div className="flex gap-12">
        <div className="flex-1 sm:w-[180px] sm:flex-none">
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

        <div className="flex-1 sm:w-[180px] sm:flex-none">
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
};
