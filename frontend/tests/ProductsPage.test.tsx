import { describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ProductsPage } from '@/features/products/ProductsPage';
import { renderWithProviders } from './test-utils';
import { server } from './setup';

// Matches any origin -- must stay in sync with the pattern in mocks/handlers.ts
// since a developer's local .env can set VITE_API_BASE_URL to anything.
const BASE_URL = '*/api';

describe('ProductsPage', () => {
  test('renders the product list when the API returns data', async () => {
    renderWithProviders(<ProductsPage />);

    expect((await screen.findAllByText('Wireless Mouse')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mechanical Keyboard').length).toBeGreaterThan(0);
  });

  test('renders the first-run empty state when there are no products', async () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({
          success: true,
          data: { products: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
          message: 'Success',
        }),
      ),
    );

    renderWithProviders(<ProductsPage />);

    expect(await screen.findByText('No products yet')).toBeInTheDocument();
  });

  test('renders an inline error state when the API call fails', async () => {
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({ success: false, message: 'Internal server error' }, { status: 500 }),
      ),
    );

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Internal server error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
