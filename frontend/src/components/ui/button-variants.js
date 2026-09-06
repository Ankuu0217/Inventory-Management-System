import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-8 whitespace-nowrap rounded-buttons text-sm font-medium transition-colors focus-visible:outline-none focus-visible:shadow-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-16 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-deep-sapphire text-canvas-white shadow-subtle hover:bg-deep-sapphire/90',
        secondary: 'bg-canvas-white text-charcoal border border-ash hover:bg-paper-mist',
        ghost: 'text-charcoal hover:bg-paper-mist',
      },
      size: {
        default: 'h-9 px-16 py-8',
        sm: 'h-8 px-12 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  },
);
