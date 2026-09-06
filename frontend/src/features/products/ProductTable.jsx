import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui/tooltip';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';
import { QuantityAdjustPopover } from '@/features/products/QuantityAdjustPopover';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';

/** Columns the API can sort on -- this exposes existing sortBy/order params. */
const SORTABLE = { name: 'Product', price: 'Price', quantity: 'Quantity' };

/**
 * Presentational product list: a dense table on desktop, stacked cards below
 * 640px. Owns no data; every interaction is reported upward.
 *
 * @param {Object} props
 * @param {import('@/types/product').Product[]} [props.products]
 * @param {(id: string) => void} props.onRowClick
 * @param {(product: import('@/types/product').Product) => void} props.onEdit
 * @param {(product: import('@/types/product').Product) => void} props.onDelete
 * @param {string} props.sortBy
 * @param {'asc'|'desc'} props.order
 * @param {(column: string) => void} props.onSort
 * @param {import('@/types/product').ProductListParams} [props.listParams]
 */
export function ProductTable({
  products = [],
  onRowClick,
  onEdit,
  onDelete,
  sortBy,
  order,
  onSort,
  listParams,
}) {
  const rows = Array.isArray(products) ? products : [];

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-cards border border-ash sm:block">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-canvas-white">
            <tr className="border-b border-ash">
              <SortableHeader
                column="name"
                sortBy={sortBy}
                order={order}
                onSort={onSort}
                className="w-[34%]"
              />
              <th className="px-16 py-10 text-left text-micro font-medium uppercase tracking-wide text-fog">
                Category
              </th>
              <SortableHeader
                column="price"
                sortBy={sortBy}
                order={order}
                onSort={onSort}
                align="right"
              />
              <SortableHeader
                column="quantity"
                sortBy={sortBy}
                order={order}
                onSort={onSort}
                align="right"
              />
              <th className="px-16 py-10 text-left text-micro font-medium uppercase tracking-wide text-fog">
                Status
              </th>
              <th className="px-16 py-10 text-right text-micro font-medium uppercase tracking-wide text-fog">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr
                key={product.id}
                onClick={() => onRowClick(product.id)}
                className="group h-52 cursor-pointer border-b border-ash transition-colors duration-150 last:border-b-0 hover:bg-paper-mist"
              >
                <td className="px-16 py-8">
                  <span className="block font-medium text-charcoal">{product.name}</span>
                  <span className="block text-micro text-fog">
                    Added {formatDate(product.createdAt)}
                  </span>
                </td>
                <td className="px-16 py-8">
                  <span className="inline-block rounded-full bg-paper-mist px-10 py-4 text-xs text-charcoal group-hover:bg-ash">
                    {product.category}
                  </span>
                </td>
                <td className="px-16 py-8 text-right tabular-nums text-charcoal">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-16 py-8 text-right tabular-nums text-charcoal">
                  {formatNumber(product.quantity)}
                </td>
                <td className="px-16 py-8">
                  <StockStatusBadge status={product.stockStatus} />
                </td>
                <td className="px-16 py-8">
                  <RowActions
                    product={product}
                    listParams={listParams}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    // Hidden until the row is hovered or something inside it is
                    // focused -- but never hidden from keyboards or touch.
                    className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-12 sm:hidden">
        {rows.map((product) => (
          <div
            key={product.id}
            onClick={() => onRowClick(product.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRowClick(product.id);
              }
            }}
            className="flex cursor-pointer flex-col gap-12 rounded-cards border border-ash bg-canvas-white p-12"
          >
            <div className="flex items-start justify-between gap-12">
              <span className="min-w-0 font-medium text-charcoal">{product.name}</span>
              <StockStatusBadge status={product.stockStatus} />
            </div>

            <span className="inline-block w-fit rounded-full bg-paper-mist px-10 py-4 text-xs text-charcoal">
              {product.category}
            </span>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-micro uppercase tracking-wide text-fog">Price</p>
                <p className="tabular-nums text-charcoal">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <p className="text-micro uppercase tracking-wide text-fog">Quantity</p>
                <p className="tabular-nums text-charcoal">{formatNumber(product.quantity)}</p>
              </div>
            </div>

            <RowActions
              product={product}
              listParams={listParams}
              onEdit={onEdit}
              onDelete={onDelete}
              className="w-full border-t border-ash pt-12 [&>*]:flex-1"
            />
          </div>
        ))}
      </div>
    </>
  );
}

ProductTable.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  onRowClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
  listParams: PropTypes.object,
};

/**
 * A header cell that toggles asc/desc on the API's existing sort params. The
 * chevron only renders solid on the active column; other columns show a muted
 * one on hover so the affordance is discoverable without being noisy.
 *
 * @param {Object} props
 * @param {'name'|'price'|'quantity'} props.column
 * @param {string} props.sortBy
 * @param {'asc'|'desc'} props.order
 * @param {(column: string) => void} props.onSort
 * @param {'left'|'right'} [props.align]
 * @param {string} [props.className]
 */
function SortableHeader({ column, sortBy, order, onSort, align = 'left', className }) {
  const isActive = sortBy === column;
  const Icon = !isActive ? ChevronsUpDown : order === 'asc' ? ChevronUp : ChevronDown;

  return (
    <th
      className={cn(
        'px-16 py-10 text-micro font-medium uppercase tracking-wide',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
      aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          // Buttons don't inherit text-transform from the <th>, so the casing
          // is restated here to keep every header identical.
          'group/sort inline-flex items-center gap-4 rounded-inputs uppercase tracking-wide transition-colors duration-150',
          isActive ? 'text-charcoal' : 'text-fog hover:text-steel',
          align === 'right' && 'w-full justify-end',
        )}
      >
        {SORTABLE[column]}
        <Icon
          className={cn(
            'h-12 w-12 transition-opacity duration-150',
            isActive ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-100',
          )}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

SortableHeader.propTypes = {
  column: PropTypes.oneOf(['name', 'price', 'quantity']).isRequired,
  sortBy: PropTypes.string.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

/**
 * @param {Object} props
 * @param {import('@/types/product').Product} props.product
 * @param {import('@/types/product').ProductListParams} [props.listParams]
 * @param {(product: import('@/types/product').Product) => void} props.onEdit
 * @param {(product: import('@/types/product').Product) => void} props.onDelete
 * @param {string} [props.className]
 */
function RowActions({ product, listParams, onEdit, onDelete, className }) {
  return (
    // These sit inside a clickable row, so their clicks must not bubble up and
    // open the detail panel as well.
    <div
      className={cn('flex items-center justify-end gap-4', className)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="presentation"
    >
      <QuantityAdjustPopover product={product} listParams={listParams} />
      <IconTooltip label="Edit">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${product.name}`}
          onClick={() => onEdit(product)}
        >
          <Pencil />
        </Button>
      </IconTooltip>
      <IconTooltip label="Delete">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${product.name}`}
          onClick={() => onDelete(product)}
        >
          <Trash2 />
        </Button>
      </IconTooltip>
    </div>
  );
}

RowActions.propTypes = {
  product: PropTypes.object.isRequired,
  listParams: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};
