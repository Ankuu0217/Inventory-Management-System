import { useState } from 'react';
import PropTypes from 'prop-types';
import { Minus, Plus, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProductQuantityMutation } from '@/api/productsApi';
import { getErrorMessage } from '@/lib/apiError';

/**
 * Inline stepper for the most-used action in the app.
 *
 * @param {Object} props
 * @param {import('@/types/product').Product} props.product
 * @param {import('@/types/product').ProductListParams} [props.listParams] passed
 *   through so the mutation can optimistically patch the right cache entry
 */
export function QuantityAdjustPopover({ product, listParams }) {
  const [open, setOpen] = useState(false);
  const [exactValue, setExactValue] = useState(String(product.quantity));
  const [syncedQuantity, setSyncedQuantity] = useState(product.quantity);
  const [updateQuantity, { isLoading }] = useUpdateProductQuantityMutation();

  // Adjust state during render (not in an effect) when the server value moves.
  if (open && product.quantity !== syncedQuantity) {
    setSyncedQuantity(product.quantity);
    setExactValue(String(product.quantity));
  }

  /** @param {'increase'|'decrease'} operation */
  async function step(operation) {
    if (operation === 'decrease' && product.quantity <= 0) return;
    try {
      await updateQuantity({
        id: product.id,
        body: { operation, amount: 1 },
        listParams,
      }).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function setExact() {
    const parsed = Number(exactValue);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error('Enter a whole number that is 0 or greater.');
      return;
    }
    try {
      await updateQuantity({ id: product.id, body: { quantity: parsed }, listParams }).unwrap();
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
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
          <span className="text-xs font-medium text-steel">Adjust quantity</span>
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
            <span className="w-48 text-center text-lg font-semibold tabular-nums text-charcoal">
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
          <Label htmlFor={`exact-quantity-${product.id}`} className="text-xs text-steel">
            Set exact value
          </Label>
          <div className="flex gap-8">
            <Input
              id={`exact-quantity-${product.id}`}
              type="number"
              inputMode="numeric"
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

QuantityAdjustPopover.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
  listParams: PropTypes.object,
};
