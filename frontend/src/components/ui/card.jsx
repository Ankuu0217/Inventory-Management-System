import * as React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

/**
 * Flat surface: 1px hairline border, never a shadow.
 *
 * @param {Object} props
 * @param {string} [props.className]
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-cards border border-ash bg-canvas-white p-16', className)}
    {...props}
  />
));
Card.displayName = 'Card';
Card.propTypes = { className: PropTypes.string };

/** @param {{className?: string}} props */
function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-4', className)} {...props} />;
}
CardHeader.propTypes = { className: PropTypes.string };

/** @param {{className?: string, children: React.ReactNode}} props */
function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-sm font-medium text-steel', className)} {...props}>
      {children}
    </h3>
  );
}
CardTitle.propTypes = { className: PropTypes.string, children: PropTypes.node };

/** @param {{className?: string}} props */
function CardContent({ className, ...props }) {
  return <div className={className} {...props} />;
}
CardContent.propTypes = { className: PropTypes.string };

export { Card, CardHeader, CardTitle, CardContent };
