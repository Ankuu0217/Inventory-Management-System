const request = require('supertest');
const app = require('../../src/app');
const { Product } = require('../../src/models/product.model');

describe('GET /api/dashboard', () => {
  beforeEach(async () => {
    await Product.create([
      {
        name: 'Laptop', category: 'Electronics', price: 1000, quantity: 15,
      }, // In Stock
      {
        name: 'Mouse', category: 'Electronics', price: 20, quantity: 5,
      }, // Low Stock
      {
        name: 'Keyboard', category: 'Electronics', price: 50, quantity: 0,
      }, // Out of Stock
      {
        name: 'Chair', category: 'Furniture', price: 150, quantity: 8,
      }, // Low Stock
      {
        name: 'Desk', category: 'Furniture', price: 300, quantity: 0,
      }, // Out of Stock
    ]);
  });

  test('returns exactly correct aggregate statistics for seeded data', async () => {
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const expectedTotalQuantity = 15 + 5 + 0 + 8 + 0;
    const expectedTotalValue = 1000 * 15 + 20 * 5 + 50 * 0 + 150 * 8 + 300 * 0;

    expect(res.body.data).toMatchObject({
      totalProducts: 5,
      totalQuantity: expectedTotalQuantity,
      lowStockCount: 2,
      outOfStockCount: 2,
      totalInventoryValue: expectedTotalValue,
    });

    expect(res.body.data.categoryBreakdown).toEqual(
      expect.arrayContaining([
        { category: 'Electronics', count: 3 },
        { category: 'Furniture', count: 2 },
      ]),
    );
  });

  test('returns all-zero statistics when there are no products', async () => {
    await Product.deleteMany({});
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalProducts: 0,
      totalQuantity: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalInventoryValue: 0,
    });
    expect(res.body.data.categoryBreakdown).toEqual([]);
  });
});
