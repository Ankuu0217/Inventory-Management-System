import * as React from 'react';
import PropTypes from 'prop-types';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * @param {Object} props
 * @param {string} [props.className]
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium text-charcoal', className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

Label.propTypes = { className: PropTypes.string };

export { Label };
