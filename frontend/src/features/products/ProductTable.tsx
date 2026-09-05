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
import type { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onRowClick: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onRowClick, onEdit, onDelete }: ProductTableProps) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                onClick={() => onRowClick(product.id)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-steel">{product.category}</TableCell>
                <TableCell className="font-geist-mono">{formatCurrency(product.price)}</TableCell>
                <TableCell className="font-geist-mono">{product.quantity}</TableCell>
                <TableCell>
                  <StockStatusBadge status={product.stockStatus} />
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center justify-end gap-8"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <QuantityAdjustPopover product={product} />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-12 sm:hidden">
        {products.map((product) => (
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
              <span className="font-geist-mono text-charcoal">{formatCurrency(product.price)}</span>
              <span className="font-geist-mono text-steel">Qty: {product.quantity}</span>
            </div>

            <div
              className="flex items-center justify-end gap-8 border-t border-ash pt-12"
              onClick={(event) => event.stopPropagation()}
            >
              <QuantityAdjustPopover product={product} />
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
          </Card>
        ))}
      </div>
    </>
  );
}
