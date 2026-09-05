import { RotateCw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';
import { useGetProductQuery } from '@/api/productsApi';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getErrorMessage } from '@/lib/apiError';

interface ProductDetailSheetProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheet({ productId, open, onOpenChange }: ProductDetailSheetProps) {
  const { data: product, isLoading, isError, error, refetch } = useGetProductQuery(
    productId ?? '',
    { skip: !productId },
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Product Details</SheetTitle>
          <SheetDescription>Read-only view of this product's current record.</SheetDescription>
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
              Retry
            </Button>
          </div>
        ) : product ? (
          <dl className="mt-24 flex flex-col gap-20">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-steel">Name</dt>
              <dd className="mt-4 text-lg font-semibold text-charcoal">{product.name}</dd>
            </div>
            <div className="flex gap-32">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-steel">Category</dt>
                <dd className="mt-4 text-sm text-charcoal">{product.category}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-steel">Status</dt>
                <dd className="mt-4">
                  <StockStatusBadge status={product.stockStatus} />
                </dd>
              </div>
            </div>
            <div className="flex gap-32">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-steel">Price</dt>
                <dd className="mt-4 font-geist-mono text-sm text-charcoal">
                  {formatCurrency(product.price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-steel">Quantity</dt>
                <dd className="mt-4 font-geist-mono text-sm text-charcoal">
                  {formatNumber(product.quantity)}
                </dd>
              </div>
            </div>
            <div className="flex gap-32 border-t border-ash pt-16">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-steel">Created</dt>
                <dd className="mt-4 text-sm text-steel">
                  {new Date(product.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-steel">Updated</dt>
                <dd className="mt-4 text-sm text-steel">
                  {new Date(product.updatedAt).toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
