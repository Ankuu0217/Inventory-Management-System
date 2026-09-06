import PropTypes from 'prop-types';
import { RotateCw } from 'lucide-react';
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
 *
 * @param {Object} props
 * @param {string | null} props.productId
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 */
export function ProductDetailSheet({ productId, open, onOpenChange }) {
  const { data: product, isLoading, isError, error, refetch } = useGetProductQuery(
    productId ?? '',
    { skip: !productId },
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-24">
        <SheetHeader>
          <SheetTitle>Product details</SheetTitle>
          <SheetDescription>A read-only view of this product&apos;s record.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-24 flex flex-col gap-16">
            <Skeleton className="h-24 w-[70%]" />
            <Skeleton className="h-16 w-[40%]" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="mt-24 flex flex-col items-start gap-12">
            <p className="text-sm text-charcoal">{getErrorMessage(error)}</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RotateCw className="h-16 w-16" />
              Try again
            </Button>
          </div>
        ) : product ? (
          <dl className="mt-24 flex flex-col gap-20">
            <Field label="Name">
              <span className="text-lg font-semibold text-charcoal">{product.name}</span>
            </Field>
            <div className="flex gap-32">
              <Field label="Category">
                <span className="text-sm text-charcoal">{product.category}</span>
              </Field>
              <Field label="Status">
                <StockStatusBadge status={product.stockStatus} />
              </Field>
            </div>
            <div className="flex gap-32">
              <Field label="Price">
                <span className="font-geist-mono text-sm tabular-nums text-charcoal">
                  {formatCurrencyPrecise(product.price)}
                </span>
              </Field>
              <Field label="Quantity">
                <span className="font-geist-mono text-sm tabular-nums text-charcoal">
                  {formatNumber(product.quantity)}
                </span>
              </Field>
            </div>
            <div className="flex gap-32 border-t border-ash pt-16">
              <Field label="Created">
                <span className="text-sm text-steel">{formatDateTime(product.createdAt)}</span>
              </Field>
              <Field label="Updated">
                <span className="text-sm text-steel">{formatDateTime(product.updatedAt)}</span>
              </Field>
            </div>
          </dl>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

ProductDetailSheet.propTypes = {
  productId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};

/** @param {{label: string, children: React.ReactNode}} props */
function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-steel">{label}</dt>
      <dd className="mt-4">{children}</dd>
    </div>
  );
}

Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };
