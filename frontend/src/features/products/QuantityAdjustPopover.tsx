import { useState } from 'react';
import { Minus, Plus, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProductQuantityMutation } from '@/api/productsApi';
import { getErrorMessage } from '@/lib/apiError';
import type { Product } from '@/types/product';

interface QuantityAdjustPopoverProps {
  product: Product;
}

export function QuantityAdjustPopover({ product }: QuantityAdjustPopoverProps) {
  const [open, setOpen] = useState(false);
  const [exactValue, setExactValue] = useState(String(product.quantity));
  const [syncedQuantity, setSyncedQuantity] = useState(product.quantity);
  const [updateQuantity, { isLoading }] = useUpdateProductQuantityMutation();

  if (open && product.quantity !== syncedQuantity) {
    setSyncedQuantity(product.quantity);
    setExactValue(String(product.quantity));
  }

  async function step(operation: 'increase' | 'decrease') {
    if (operation === 'decrease' && product.quantity <= 0) return;
    try {
      await updateQuantity({ id: product.id, body: { operation, amount: 1 } }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]));
    }
  }

  async function setExact() {
    const parsed = Number(exactValue);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error('Enter a whole number that is 0 or greater.');
      return;
    }
    try {
      await updateQuantity({ id: product.id, body: { quantity: parsed } }).unwrap();
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]));
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={`Adjust quantity for ${product.name}`}>
          <PlusCircle className="h-16 w-16" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-16">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-medium uppercase tracking-wide text-steel">
            Adjust quantity
          </span>
          <div className="flex items-center justify-center gap-12">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Decrease quantity by 1"
              onClick={() => step('decrease')}
              disabled={isLoading || product.quantity <= 0}
            >
              <Minus className="h-16 w-16" />
            </Button>
            <span className="w-48 text-center text-lg font-semibold text-charcoal">
              {product.quantity}
            </span>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Increase quantity by 1"
              onClick={() => step('increase')}
              disabled={isLoading}
            >
              <Plus className="h-16 w-16" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8 border-t border-ash pt-16">
          <Label htmlFor={`exact-quantity-${product.id}`} className="text-xs uppercase tracking-wide text-steel">
            Set exact value
          </Label>
          <div className="flex gap-8">
            <Input
              id={`exact-quantity-${product.id}`}
              type="number"
              min="0"
              step="1"
              value={exactValue}
              onChange={(event) => setExactValue(event.target.value)}
            />
            <Button variant="primary" onClick={setExact} disabled={isLoading}>
              Set
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
