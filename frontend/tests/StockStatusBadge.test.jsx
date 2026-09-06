import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';

describe('StockStatusBadge', () => {
  test.each(['In Stock', 'Low Stock', 'Out of Stock'])(
    'renders the "%s" label as visible text, not just a colour',
    (status) => {
      render(<StockStatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );
});
