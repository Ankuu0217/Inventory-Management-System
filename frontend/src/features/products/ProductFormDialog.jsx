import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';
import { useCreateProductMutation, useUpdateProductMutation } from '@/api/productsApi';
import { productSchema } from '@/features/products/productSchema';
import { getErrorMessage, getFieldErrors } from '@/lib/apiError';
import { previewStockStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

const EMPTY_DEFAULTS = { name: '', category: '', price: 0, quantity: 0 };
const FIELD_NAMES = Object.keys(EMPTY_DEFAULTS);

/**
 * One dialog, one schema, two modes -- used for both create and edit.
 *
 * @param {Object} props
 * @param {'create'|'edit'} props.mode
 * @param {import('@/types/product').Product} [props.product] required in edit mode
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {string[]} [props.categories] existing categories, offered as suggestions
 */
export function ProductFormDialog({ mode, product, open, onOpenChange, categories = [] }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_DEFAULTS,
    // Validate on blur, then keep correcting as they fix it -- never scold on
    // the first keystroke of a field they're still filling in.
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const quantityValue = useWatch({ control, name: 'quantity' });

  useEffect(() => {
    if (!open) return;
    reset(
      mode === 'edit' && product
        ? {
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
          }
        : EMPTY_DEFAULTS,
    );
  }, [open, mode, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === 'edit' && product) {
        await updateProduct({ id: product.id, body: values }).unwrap();
        toast.success('Product updated');
      } else {
        await createProduct(values).unwrap();
        toast.success('Product created');
      }
      onOpenChange(false);
    } catch (error) {
      const mapped = getFieldErrors(error).filter(({ field }) => FIELD_NAMES.includes(field));
      if (mapped.length > 0) {
        mapped.forEach(({ field, message }) => setError(field, { message }));
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update this product’s details and stock level.'
              : 'Add a product to your catalogue and set its opening stock.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-16" noValidate>
          <Field label="Product name" htmlFor="product-name" error={errors.name?.message}>
            {/* No autoFocus prop needed: Radix moves focus into the dialog on
                open, and this is the first tabbable element inside it. */}
            <input
              id="product-name"
              className={inputClass(errors.name)}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </Field>

          <Field label="Category" htmlFor="product-category" error={errors.category?.message}>
            <input
              id="product-category"
              list="category-suggestions"
              className={inputClass(errors.category)}
              aria-invalid={Boolean(errors.category)}
              {...register('category')}
            />
            <datalist id="category-suggestions">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-16">
            <Field label="Price" htmlFor="product-price" error={errors.price?.message}>
              <div className="relative">
                <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-fog">
                  ₹
                </span>
                <input
                  id="product-price"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  className={cn(inputClass(errors.price), 'pl-24 text-right tabular-nums')}
                  aria-invalid={Boolean(errors.price)}
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
            </Field>

            <Field label="Quantity" htmlFor="product-quantity" error={errors.quantity?.message}>
              <input
                id="product-quantity"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                className={cn(inputClass(errors.quantity), 'text-right tabular-nums')}
                aria-invalid={Boolean(errors.quantity)}
                {...register('quantity', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <StatusPreview quantity={quantityValue} />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : mode === 'edit' ? (
                'Save changes'
              ) : (
                'Add product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ProductFormDialog.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  product: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
};

/**
 * @param {import('react-hook-form').FieldError} [error]
 * @returns {string} the input class list, with the error border when invalid
 */
function inputClass(error) {
  return cn(
    'h-40 w-full rounded-inputs border bg-canvas-white px-10 text-sm text-charcoal transition-colors duration-150',
    error ? 'border-tangerine' : 'border-midnight-ink',
  );
}

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.htmlFor
 * @param {string} [props.error]
 * @param {React.ReactNode} props.children
 */
function Field({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-6">
      <label htmlFor={htmlFor} className="text-xs font-medium text-charcoal">
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-4 text-xs text-tangerine">
          <CircleAlert className="h-12 w-12 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  htmlFor: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
};

/**
 * Shows which badge this quantity will produce. Purely a client-side preview of
 * a rule the backend owns -- it makes the business logic visible without a
 * single extra request, and the saved row still renders the server's own value.
 *
 * @param {{quantity: number}} props
 */
function StatusPreview({ quantity }) {
  if (!Number.isFinite(quantity)) return null;
  return (
    <div className="flex items-center gap-8 rounded-inputs bg-paper-mist px-12 py-8">
      <span className="text-xs text-steel">This product will show as</span>
      <StockStatusBadge status={previewStockStatus(quantity)} />
    </div>
  );
}

StatusPreview.propTypes = { quantity: PropTypes.number };
