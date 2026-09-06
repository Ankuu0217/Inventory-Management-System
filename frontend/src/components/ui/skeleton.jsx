import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

/**
 * @param {Object} props
 * @param {string} [props.className]
 */
function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-cards bg-ash', className)} {...props} />;
}

Skeleton.propTypes = { className: PropTypes.string };

export { Skeleton };
