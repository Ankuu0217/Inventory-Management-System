const request = require('supertest');
const app = require('../../src/app');
const { Product } = require('../../src/models/product.model');

const validProduct = {
  name: 'Wireless Mouse',
  category: 'Electronics',
  price: 25.99,
  quantity: 42,
};

describe('POST /api/products', () => {
  test('creates a product (happy path)', async () => {
    const res = await request(app).post('/api/products').send(validProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: validProduct.name,
      category: validProduct.category,
      price: validProduct.price,
      quantity: validProduct.quantity,
      stockStatus: 'In Stock',
    });
    expect(res.body.data.id).toBeDefined();
  });

  test.each([
    ['name', { ...validProduct, name: '' }],
    ['category', { ...validProduct, category: '' }],
    ['price', { ...validProduct, price: -1 }],
    ['quantity', { ...validProduct, quantity: -1 }],
  ])('rejects missing/invalid %s with 400', async (field, payload) => {
    const res = await request(app).post('/api/products').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.field === field)).toBe(true);
  });

  test('rejects non-integer quantity with 400', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validProduct, quantity: 1.5 });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'quantity')).toBe(true);
  });
});

describe('GET /api/products', () => {
  beforeEach(async () => {
    await Product.create([
      {
        name: 'Laptop Pro', category: 'Electronics', price: 1200, quantity: 15,
      },
      {
        name: 'Laptop Stand', category: 'Electronics', price: 30, quantity: 5,
      },
      {
        name: 'Office Chair', category: 'Furniture', price: 150, quantity: 0,
      },
      {
        name: 'Desk Lamp', category: 'Furniture', price: 20, quantity: 100,
      },
    ]);
  });

  test('lists all products with default pagination', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(4);
    expect(res.body.data.pagination).toMatchObject({ total: 4, page: 1, limit: 10 });
  });

  test('searches by partial, case-insensitive name', async () => {
    const res = await request(app).get('/api/products').query({ search: 'lap' });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(2);
    expect(res.body.data.products.every((p) => p.name.toLowerCase().includes('lap'))).toBe(true);
  });

  test('filters by exact category', async () => {
    const res = await request(app).get('/api/products').query({ category: 'Furniture' });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(2);
    expect(res.body.data.products.every((p) => p.category === 'Furniture')).toBe(true);
  });

  test('filters by stock status (lowStock)', async () => {
    const res = await request(app).get('/api/products').query({ status: 'lowStock' });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe('Laptop Stand');
  });

  test('filters by stock status (outOfStock)', async () => {
    const res = await request(app).get('/api/products').query({ status: 'outOfStock' });

    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe('Office Chair');
  });

  test('combines search + category + status filters', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ search: 'lap', category: 'Electronics', status: 'lowStock' });

    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe('Laptop Stand');
  });

  test('paginates results', async () => {
    const res = await request(app).get('/api/products').query({ page: 2, limit: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(2);
    expect(res.body.data.pagination).toMatchObject({
      total: 4, page: 2, limit: 2, totalPages: 2,
    });
  });

  test('rejects an invalid status filter with 400', async () => {
    const res = await request(app).get('/api/products').query({ status: 'bogus' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  test('returns the product when found', async () => {
    const product = await Product.create(validProduct);
    const res = await request(app).get(`/api/products/${product.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(product.id);
  });

  test('returns 404 when not found', async () => {
    const res = await request(app).get('/api/products/650000000000000000000000');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/products/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/products/:id', () => {
  test('updates a product (happy path)', async () => {
    const product = await Product.create(validProduct);
    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .send({ ...validProduct, price: 19.99, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(19.99);
    expect(res.body.data.stockStatus).toBe('Low Stock');
  });

  test('returns 404 when the product does not exist', async () => {
    const res = await request(app)
      .put('/api/products/650000000000000000000000')
      .send(validProduct);
    expect(res.status).toBe(404);
  });

  test('returns 400 on validation failure', async () => {
    const product = await Product.create(validProduct);
    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .send({ ...validProduct, price: -5 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/products/:id', () => {
  test('deletes a product (happy path)', async () => {
    const product = await Product.create(validProduct);
    const res = await request(app).delete(`/api/products/${product.id}`);

    expect(res.status).toBe(200);
    expect(await Product.findById(product.id)).toBeNull();
  });

  test('returns 404 when the product does not exist', async () => {
    const res = await request(app).delete('/api/products/650000000000000000000000');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/products/:id/quantity', () => {
  test('sets an absolute quantity', async () => {
    const product = await Product.create(validProduct);
    const res = await request(app)
      .patch(`/api/products/${product.id}/quantity`)
      .send({ quantity: 25 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(25);
  });

  test('applies a relative increase', async () => {
    const product = await Product.create({ ...validProduct, quantity: 10 });
    const res = await request(app)
      .patch(`/api/products/${product.id}/quantity`)
      .send({ operation: 'increase', amount: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(15);
  });

  test('applies a relative decrease', async () => {
    const product = await Product.create({ ...validProduct, quantity: 10 });
    const res = await request(app)
      .patch(`/api/products/${product.id}/quantity`)
      .send({ operation: 'decrease', amount: 4 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(6);
  });

  test('rejects a decrease that would push quantity below zero', async () => {
    const product = await Product.create({ ...validProduct, quantity: 3 });
    const res = await request(app)
      .patch(`/api/products/${product.id}/quantity`)
      .send({ operation: 'decrease', amount: 10 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    const unchanged = await Product.findById(product.id);
    expect(unchanged.quantity).toBe(3);
  });

  test('rejects an invalid body shape with 400', async () => {
    const product = await Product.create(validProduct);
    const res = await request(app)
      .patch(`/api/products/${product.id}/quantity`)
      .send({ operation: 'sideways', amount: 1 });

    expect(res.status).toBe(400);
  });
});
