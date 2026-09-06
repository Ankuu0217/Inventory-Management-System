import * as React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.type]
 */
const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-inputs border border-midnight-ink bg-canvas-white px-12 py-8 text-sm text-charcoal placeholder:text-fog transition-shadow',
      'focus-visible:outline-none focus-visible:shadow-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

Input.propTypes = { className: PropTypes.string, type: PropTypes.string };

export { Input };
