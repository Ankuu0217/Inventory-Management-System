import * as React from 'react';
import PropTypes from 'prop-types';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-midnight-ink/40',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;
SheetOverlay.propTypes = { className: PropTypes.string };

const sheetVariants = cva(
  'fixed z-50 flex flex-col border-ash bg-canvas-white shadow-ring transition ease-out data-[state=closed]:duration-200 data-[state=open]:duration-200',
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-full w-full max-w-[420px] border-l data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        left: 'inset-y-0 left-0 h-full w-full max-w-[280px] border-r data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      },
    },
    defaultVariants: { side: 'right' },
  },
);

/**
 * @param {Object} props
 * @param {'left'|'right'} [props.side]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const SheetContent = React.forwardRef(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-16 top-16 rounded-inputs text-fog transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:shadow-ring">
        <X className="h-16 w-16" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;
SheetContent.propTypes = {
  side: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  children: PropTypes.node,
};

/** @param {{className?: string}} props */
function SheetHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-4 text-left', className)} {...props} />;
}
SheetHeader.propTypes = { className: PropTypes.string };

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-charcoal', className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;
SheetTitle.propTypes = { className: PropTypes.string };

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-steel', className)} {...props} />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
SheetDescription.propTypes = { className: PropTypes.string };

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };
