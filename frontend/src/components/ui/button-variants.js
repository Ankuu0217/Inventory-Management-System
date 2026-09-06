import { cva } from 'class-variance-authority';

/**
 * The button vocabulary. Exactly one primary action per screen; destructive
 * actions reuse `secondary` on purpose -- the palette has no red, and the
 * confirmation dialog is what carries the weight.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-6 whitespace-nowrap rounded-buttons font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-deep-sapphire text-canvas-white shadow-subtle hover:bg-deep-sapphire/90',
        secondary: 'border border-ash bg-canvas-white text-charcoal hover:bg-paper-mist',
        ghost: 'text-steel hover:bg-ash hover:text-charcoal',
      },
      size: {
        default: 'h-36 px-12 text-sm [&_svg]:size-16',
        sm: 'h-32 px-10 text-xs [&_svg]:size-12',
        icon: 'h-32 w-32 [&_svg]:size-16',
        iconSm: 'h-24 w-24 [&_svg]:size-12',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  },
);
