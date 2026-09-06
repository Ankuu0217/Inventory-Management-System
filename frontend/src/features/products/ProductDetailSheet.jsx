import PropTypes from 'prop-types';
import { Pencil, RotateCw, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';
import { useGetProductQuery } from '@/api/productsApi';
import { formatCurrencyPrecise, formatNumber, formatDateTime } from '@/lib/utils';
import { getErrorMessage } from '@/lib/apiError';

/**
 * Read-only slide-over for a single product, also reachable at /products/:id.
 * Edit and Delete are pinned at the foot so the primary path off this panel is
 * always in the same place. Those actions deliberately leave this panel open
 * and let their dialog stack above it: closing one Radix layer while another
 * is mounting dismisses the new one.
 *
 * @param {Object} props
 * @param {string | null} props.productId
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {(product: import('@/types/product').Product) => void} [props.onEdit]
 * @param {(product: import('@/types/product').Product) => void} [props.onDelete]
 */
export function ProductDetailSheet({ productId, open, onOpenChange, onEdit, onDelete }) {
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductQuery(productId ?? '', { skip: !productId });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-24">
          <SheetHeader>
            <SheetTitle>Product details</SheetTitle>
            <SheetDescription>A read-only view of this product&apos;s record.</SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="mt-24 flex flex-col gap-16">
              <Skeleton className="h-24 w-[70%] rounded-inputs" />
              <Skeleton className="h-16 w-[40%] rounded-inputs" />
              <Skeleton className="h-64 w-full rounded-cards" />
            </div>
          ) : isError ? (
            <div className="mt-24 flex flex-col items-start gap-12">
              <p className="text-sm text-charcoal">{getErrorMessage(error)}</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                <RotateCw />
                Try again
              </Button>
            </div>
          ) : product ? (
            <dl className="mt-24 flex flex-col gap-20">
              <Field label="Product name">
                <span className="text-base font-medium text-charcoal">{product.name}</span>
              </Field>

              <div className="grid grid-cols-2 gap-20">
                <Field label="Category">
                  <span className="inline-block rounded-full bg-paper-mist px-10 py-4 text-xs text-charcoal">
                    {product.category}
                  </span>
                </Field>
                <Field label="Status">
                  <StockStatusBadge status={product.stockStatus} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-20">
                <Field label="Price">
                  <span className="text-sm tabular-nums text-charcoal">
                    {formatCurrencyPrecise(product.price)}
                  </span>
                </Field>
                <Field label="Quantity">
                  <span className="text-sm tabular-nums text-charcoal">
                    {formatNumber(product.quantity)}
                  </span>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-20 border-t border-ash pt-20">
                <Field label="Created">
                  <span className="text-sm text-steel">{formatDateTime(product.createdAt)}</span>
                </Field>
                <Field label="Last updated">
                  <span className="text-sm text-steel">{formatDateTime(product.updatedAt)}</span>
                </Field>
              </div>
            </dl>
          ) : null}
        </div>

        {product ? (
          <div className="flex gap-8 border-t border-ash p-16">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onEdit?.(product)}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onDelete?.(product)}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

ProductDetailSheet.propTypes = {
  productId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

/** @param {{label: string, children: React.ReactNode}} props */
function Field({ label, children }) {
  return (
    <div>
      <dt className="text-micro font-medium uppercase tracking-wide text-fog">{label}</dt>
      <dd className="mt-6">{children}</dd>
    </div>
  );
}

Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };
