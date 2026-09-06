import PropTypes from 'prop-types';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';
import { QuantityAdjustPopover } from '@/features/products/QuantityAdjustPopover';
import { formatCurrency } from '@/lib/utils';

/**
 * Presentational product list: a table on desktop, stacked cards on mobile.
 *
 * @param {Object} props
 * @param {import('@/types/product').Product[]} [props.products]
 * @param {(id: string) => void} props.onRowClick
 * @param {(product: import('@/types/product').Product) => void} props.onEdit
 * @param {(product: import('@/types/product').Product) => void} props.onDelete
 * @param {import('@/types/product').ProductListParams} [props.listParams]
 */
export function ProductTable({ products = [], onRowClick, onEdit, onDelete, listParams }) {
  const rows = Array.isArray(products) ? products : [];

  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((product) => (
              <TableRow
                key={product.id}
                onClick={() => onRowClick(product.id)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-steel">{product.category}</TableCell>
                <TableCell className="tabular-nums">{formatCurrency(product.price)}</TableCell>
                <TableCell className="tabular-nums">{product.quantity}</TableCell>
                <TableCell>
                  <StockStatusBadge status={product.stockStatus} />
                </TableCell>
                <TableCell>
                  <RowActions
                    product={product}
                    listParams={listParams}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-12 sm:hidden">
        {rows.map((product) => (
          <Card
            key={product.id}
            onClick={() => onRowClick(product.id)}
            className="flex cursor-pointer flex-col gap-12"
          >
            <div className="flex items-start justify-between gap-12">
              <div>
                <p className="font-medium text-charcoal">{product.name}</p>
                <p className="text-sm text-steel">{product.category}</p>
              </div>
              <StockStatusBadge status={product.stockStatus} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="tabular-nums text-charcoal">{formatCurrency(product.price)}</span>
              <span className="tabular-nums text-steel">Qty: {product.quantity}</span>
            </div>

            <div className="border-t border-ash pt-12">
              <RowActions
                product={product}
                listParams={listParams}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </Card>
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
  listParams: PropTypes.object,
};

/**
 * @param {Object} props
 * @param {import('@/types/product').Product} props.product
 * @param {import('@/types/product').ProductListParams} [props.listParams]
 * @param {(product: import('@/types/product').Product) => void} props.onEdit
 * @param {(product: import('@/types/product').Product) => void} props.onDelete
 */
function RowActions({ product, listParams, onEdit, onDelete }) {
  return (
    // Actions live inside a clickable row, so their clicks must not bubble up
    // and open the detail panel as well.
    <div
      className="flex items-center justify-end gap-8"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="presentation"
    >
      <QuantityAdjustPopover product={product} listParams={listParams} />
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Edit ${product.name}`}
        onClick={() => onEdit(product)}
      >
        <Pencil className="h-16 w-16" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Delete ${product.name}`}
        onClick={() => onDelete(product)}
      >
        <Trash2 className="h-16 w-16" />
      </Button>
    </div>
  );
}

RowActions.propTypes = {
  product: PropTypes.object.isRequired,
  listParams: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
