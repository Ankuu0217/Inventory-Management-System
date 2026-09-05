import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProductMutation, useUpdateProductMutation } from '@/api/productsApi';
import { productSchema, type ProductFormValues } from '@/features/products/productSchema';
import { getErrorMessage, getFieldErrors } from '@/lib/apiError';
import type { Product } from '@/types/product';

interface ProductFormDialogProps {
  mode: 'create' | 'edit';
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
}

const EMPTY_DEFAULTS: ProductFormValues = { name: '', category: '', price: 0, quantity: 0 };

export function ProductFormDialog({
  mode,
  product,
  open,
  onOpenChange,
  categories,
}: ProductFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  useEffect(() => {
    if (open) {
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
    }
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
      const fieldErrors = getFieldErrors(error as Parameters<typeof getFieldErrors>[0]);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          if (field in EMPTY_DEFAULTS) {
            setError(field as keyof ProductFormValues, { message });
          }
        });
      } else {
        toast.error(getErrorMessage(error as Parameters<typeof getErrorMessage>[0]));
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the details for this product.'
              : 'Fill in the details for the new product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-16" noValidate>
          <div className="flex flex-col gap-4">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" {...register('name')} aria-invalid={!!errors.name} />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              list="category-suggestions"
              {...register('category')}
              aria-invalid={!!errors.category}
            />
            <datalist id="category-suggestions">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <FieldError message={errors.category?.message} />
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div className="flex flex-col gap-4">
              <Label htmlFor="product-price">Price</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-sm text-fog">
                  ₹
                </span>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-24"
                  {...register('price', { valueAsNumber: true })}
                  aria-invalid={!!errors.price}
                />
              </div>
              <FieldError message={errors.price?.message} />
            </div>

            <div className="flex flex-col gap-4">
              <Label htmlFor="product-quantity">Quantity</Label>
              <Input
                id="product-quantity"
                type="number"
                step="1"
                min="0"
                {...register('quantity', { valueAsNumber: true })}
                aria-invalid={!!errors.quantity}
              />
              <FieldError message={errors.quantity?.message} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-16 w-16 animate-spin" />
                  {mode === 'edit' ? 'Saving...' : 'Creating...'}
                </>
              ) : mode === 'edit' ? (
                'Save Changes'
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-4 text-xs text-tangerine">
      <CircleAlert className="h-12 w-12 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
