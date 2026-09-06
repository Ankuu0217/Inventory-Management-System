import { useState } from 'react';
import PropTypes from 'prop-types';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui/tooltip';
import { useUpdateProductQuantityMutation } from '@/api/productsApi';
import { getErrorMessage } from '@/lib/apiError';

/**
 * Inline stepper for the most-used action in the app. The mutation is
 * optimistic (see productsApi), so the number moves on click and rolls back
 * with a toast if the server disagrees.
 *
 * @param {Object} props
 * @param {import('@/types/product').Product} props.product
 * @param {import('@/types/product').ProductListParams} [props.listParams] passed
 *   through so the mutation patches the right cache entry
 */
export function QuantityAdjustPopover({ product, listParams }) {
  const [open, setOpen] = useState(false);
  const [exactMode, setExactMode] = useState(false);
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
      await updateQuantity({ id: product.id, body: { operation, amount: 1 }, listParams }).unwrap();
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
      setExactMode(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setExactMode(false);
      }}
    >
      <IconTooltip label="Adjust quantity">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Adjust quantity for ${product.name}`}>
            <PlusMinusGlyph />
          </Button>
        </PopoverTrigger>
      </IconTooltip>

      <PopoverContent align="end" className="w-[248px] p-12">
        <p className="text-micro font-medium uppercase tracking-wide text-fog">Adjust quantity</p>

        <div className="mt-12 flex items-center gap-8">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Decrease quantity by 1"
            onClick={() => step('decrease')}
            disabled={isLoading || product.quantity <= 0}
          >
            <Minus />
          </Button>

          {exactMode ? (
            <>
              <label htmlFor={`exact-quantity-${product.id}`} className="sr-only">
                Set exact quantity
              </label>
              <input
                id={`exact-quantity-${product.id}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={exactValue}
                onChange={(event) => setExactValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setExact();
                  }
                }}
                className="h-32 min-w-0 flex-1 rounded-inputs border border-midnight-ink bg-canvas-white px-8 text-center text-base tabular-nums text-charcoal"
              />
            </>
          ) : (
            <span className="flex-1 text-center text-base font-medium tabular-nums text-charcoal">
              {product.quantity}
            </span>
          )}

          <Button
            variant="secondary"
            size="icon"
            aria-label="Increase quantity by 1"
            onClick={() => step('increase')}
            disabled={isLoading}
          >
            <Plus />
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-between gap-8 border-t border-ash pt-12">
          <button
            type="button"
            onClick={() => setExactMode((current) => !current)}
            className="rounded-inputs text-xs text-steel transition-colors duration-150 hover:text-charcoal"
          >
            {exactMode ? 'Use stepper' : 'Set exact value'}
          </button>
          {exactMode ? (
            <Button variant="primary" size="sm" onClick={setExact} disabled={isLoading}>
              Save
            </Button>
          ) : null}
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

/** A compact ± mark; lucide has no single glyph for it. */
function PlusMinusGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h6M6 1.5v6M3 12.5h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
