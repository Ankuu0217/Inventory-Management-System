import PropTypes from 'prop-types';
import { PackageOpen, Plus, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveFilterChips } from '@/features/products/ActiveFilterChips';

/**
 * First run: there are genuinely no products. This is the app's one display
 * moment -- the only place the 36px display face is used.
 *
 * @param {{onAddProduct: () => void}} props
 */
export function NoProductsYet({ onAddProduct }) {
  return (
    <div className="flex flex-col items-center gap-16 rounded-largecards border border-ash bg-canvas-white px-24 py-48 text-center">
      <PackageOpen className="h-40 w-40 text-silver" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex flex-col gap-8">
        <h2 className="font-display text-4xl font-medium tracking-[-0.02em] text-charcoal">
          Nothing in stock yet
        </h2>
        <p className="mx-auto max-w-[420px] text-sm text-steel">
          Add your first product and its stock level will start showing up here and on the
          dashboard.
        </p>
      </div>
      <Button variant="primary" onClick={onAddProduct}>
        <Plus />
        Add product
      </Button>
    </div>
  );
}

NoProductsYet.propTypes = { onAddProduct: PropTypes.func.isRequired };

/**
 * The filters matched nothing. Deliberately different copy from the first-run
 * state, and it shows the active filters back so the user can see exactly what
 * excluded everything.
 *
 * @param {Object} props
 * @param {string} props.search
 * @param {string} props.category
 * @param {'all'|import('@/types/product').StatusFilter} props.status
 * @param {(key: 'search'|'category'|'status') => void} props.onClear
 * @param {() => void} props.onClearAll
 */
export function NoFilterMatches({ search, category, status, onClear, onClearAll }) {
  return (
    <div className="flex flex-col items-center gap-16 rounded-largecards border border-ash bg-canvas-white px-24 py-48 text-center">
      <SearchX className="h-40 w-40 text-silver" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex flex-col gap-8">
        <h2 className="text-base font-medium text-charcoal">No products match these filters</h2>
        <p className="mx-auto max-w-[420px] text-sm text-steel">
          Nothing in your catalogue matches every filter below at once.
        </p>
      </div>

      <div className="w-full max-w-[520px]">
        <ActiveFilterChips
          search={search}
          category={category}
          status={status}
          onClear={onClear}
          onClearAll={onClearAll}
        />
      </div>

      <Button variant="secondary" onClick={onClearAll}>
        Clear filters
      </Button>
    </div>
  );
}

NoFilterMatches.propTypes = {
  search: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onClear: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
};

/** Table skeleton with the real column count and row height, so nothing jumps. */
export function ProductTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-cards border border-ash">
      <div className="flex items-center gap-16 border-b border-ash px-16 py-10">
        {['34%', '14%', '12%', '12%', '14%', '10%'].map((width) => (
          <div key={width} className="h-10 animate-pulse rounded-full bg-ash" style={{ width }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-52 items-center gap-16 border-b border-ash px-16 last:border-b-0"
        >
          {['34%', '14%', '12%', '12%', '14%', '10%'].map((width) => (
            <div
              key={width}
              className="h-12 animate-pulse rounded-full bg-paper-mist"
              style={{ width }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
