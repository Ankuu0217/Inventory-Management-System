import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockStatusBadge } from '@/features/products/StockStatusBadge';
import type { StockStatus } from '@/types/product';

describe('StockStatusBadge', () => {
  test.each<StockStatus>(['In Stock', 'Low Stock', 'Out of Stock'])(
    'renders the "%s" label as visible text, not just a color',
    (status) => {
      render(<StockStatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );
});
