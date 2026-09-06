import { useState } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';
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
import { useDeleteProductMutation } from '@/api/productsApi';
import { getErrorMessage } from '@/lib/apiError';

/**
 * Confirmation step for a destructive action. The weight lives in the
 * confirmation itself, not in a red button -- the palette has no red.
 *
 * @param {Object} props
 * @param {import('@/types/product').Product | null} props.product
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 */
export function DeleteConfirmDialog({ product = null, open, onOpenChange }) {
  const [deleteProduct] = useDeleteProductMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id).unwrap();
      toast.success('Product deleted');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription>
            This will permanently delete{' '}
            <span className="font-medium text-charcoal">{product?.name}</span>. This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

DeleteConfirmDialog.propTypes = {
  product: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
