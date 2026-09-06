import * as React from 'react';
import PropTypes from 'prop-types';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
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
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
DialogOverlay.propTypes = { className: PropTypes.string };

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-16 rounded-largecards border border-ash bg-canvas-white p-24 shadow-ring',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-16 top-16 rounded-inputs text-fog transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:shadow-ring">
        <X className="h-16 w-16" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;
DialogContent.propTypes = { className: PropTypes.string, children: PropTypes.node };

/** @param {{className?: string}} props */
function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-4 text-left', className)} {...props} />;
}
DialogHeader.propTypes = { className: PropTypes.string };

/** @param {{className?: string}} props */
function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-8 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}
DialogFooter.propTypes = { className: PropTypes.string };

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-charcoal', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
DialogTitle.propTypes = { className: PropTypes.string };

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-steel', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
DialogDescription.propTypes = { className: PropTypes.string };

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
