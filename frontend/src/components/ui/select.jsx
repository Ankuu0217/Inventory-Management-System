import * as React from 'react';
import PropTypes from 'prop-types';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between gap-8 rounded-inputs border border-midnight-ink bg-canvas-white px-12 py-8 text-sm text-charcoal',
      'focus:outline-none focus:shadow-ring disabled:cursor-not-allowed disabled:opacity-50',
      '[&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-16 w-16 text-fog" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
SelectTrigger.propTypes = { className: PropTypes.string, children: PropTypes.node };

const SelectContent = React.forwardRef(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-cards border border-ash bg-canvas-white text-charcoal shadow-ring',
          position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-4">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;
SelectContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  position: PropTypes.oneOf(['popper', 'item-aligned']),
};

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-inputs py-8 pl-32 pr-8 text-sm outline-none',
      'focus:bg-paper-mist data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-8 flex h-16 w-16 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-12 w-12 text-electric-blue" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
SelectItem.propTypes = { className: PropTypes.string, children: PropTypes.node };

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
