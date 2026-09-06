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
 * @param {import('@/types/product').Product | null} [props.product]
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {() => void} [props.onDeleted] fired only after a successful delete
 */
export function DeleteConfirmDialog({ product = null, open, onOpenChange, onDeleted }) {
  const [deleteProduct] = useDeleteProductMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id).unwrap();
      toast.success(`Deleted ${product.name}`);
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            Delete <span className="font-semibold">{product?.name}</span>?
          </DialogTitle>
          <DialogDescription>
            This removes the product and its stock level from your catalogue. It can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete product'
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
  onDeleted: PropTypes.func,
};
