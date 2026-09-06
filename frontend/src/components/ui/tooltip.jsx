import * as React from 'react';
import PropTypes from 'prop-types';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-inputs border border-ash bg-canvas-white px-8 py-4 text-xs text-charcoal shadow-ring',
        'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
TooltipContent.propTypes = { className: PropTypes.string, sideOffset: PropTypes.number };

/**
 * Convenience wrapper: an icon button with a label that appears on hover and
 * on keyboard focus, without repeating the Radix scaffolding at every call.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.children the trigger element
 */
function IconTooltip({ label, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

IconTooltip.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, IconTooltip };
