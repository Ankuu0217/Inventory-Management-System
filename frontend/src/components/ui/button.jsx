import * as React from 'react';
import PropTypes from 'prop-types';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button-variants';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'primary'|'secondary'|'ghost'} [props.variant]
 * @param {'default'|'sm'|'icon'} [props.size]
 * @param {boolean} [props.asChild] render the child element instead of a <button>
 */
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['default', 'sm', 'icon']),
  asChild: PropTypes.bool,
};

export { Button };
