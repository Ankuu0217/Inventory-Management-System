import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { badgeVariants } from '@/components/ui/badge-variants';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {'neutral'|'active'} [props.variant]
 */
function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['neutral', 'active']),
};

export { Badge };
