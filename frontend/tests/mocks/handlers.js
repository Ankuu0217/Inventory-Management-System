import { http, HttpResponse } from 'msw';

// Matches any origin -- tests must not depend on whatever VITE_API_BASE_URL
// happens to be set to in a developer's local .env file.
const BASE_URL = '*/api';

/** @type {import('@/types/product').Product[]} */
export const sampleProducts = [
  {
    id: '1',
    name: 'Wireless Mouse',
    category: 'Electronics',
    price: 799.99,
    quantity: 42,
    stockStatus: 'In Stock',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 3499,
    quantity: 5,
    stockStatus: 'Low Stock',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

export const handlers = [
  http.get(`${BASE_URL}/products`, () =>
    HttpResponse.json({
      success: true,
      data: {
        products: sampleProducts,
        pagination: { total: sampleProducts.length, page: 1, limit: 10, totalPages: 1 },
      },
      message: 'Success',
    }),
  ),

  http.get(`${BASE_URL}/dashboard`, () =>
    HttpResponse.json({
      success: true,
      data: {
        totalProducts: 2,
        totalQuantity: 47,
        lowStockCount: 1,
        outOfStockCount: 0,
        totalInventoryValue: 50993.58,
        categoryBreakdown: [{ category: 'Electronics', count: 2 }],
      },
      message: 'Success',
    }),
  ),

  http.post(`${BASE_URL}/products`, async ({ request }) => {
    const body = await request.json();
    if (!body.name) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'name', message: 'Name is required' }],
        },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        data: { ...sampleProducts[0], id: '3', name: body.name },
        message: 'Product created successfully',
      },
      { status: 201 },
    );
  }),
];
