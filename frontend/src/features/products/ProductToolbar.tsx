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
import type { StatusFilter } from '@/types/product';

const ALL_CATEGORIES = 'all';

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: StatusFilter | 'all';
  onStatusChange: (value: StatusFilter | 'all') => void;
  availableCategories: string[];
}

export function ProductToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  availableCategories,
}: ProductToolbarProps) {
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
            value={category || ALL_CATEGORIES}
            onValueChange={(value) => onCategoryChange(value === ALL_CATEGORIES ? '' : value)}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
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
          <Select value={status} onValueChange={(value) => onStatusChange(value as StatusFilter | 'all')}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All Statuses" />
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
