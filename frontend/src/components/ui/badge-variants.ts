import { cva } from 'class-variance-authority';

export const badgeVariants = cva('inline-flex items-center gap-8 rounded-full px-12 py-4 text-xs font-medium', {
  variants: {
    variant: {
      neutral: 'bg-paper-mist text-steel',
      active: 'bg-sidebar-active text-deep-sapphire',
    },
  },
  defaultVariants: { variant: 'neutral' },
});
