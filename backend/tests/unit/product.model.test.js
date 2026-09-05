const mongoose = require('mongoose');
const { Product, STOCK_STATUS } = require('../../src/models/product.model');

describe('Product model - stockStatus virtual', () => {
  test.each([
    [0, STOCK_STATUS.OUT_OF_STOCK],
    [1, STOCK_STATUS.LOW_STOCK],
    [5, STOCK_STATUS.LOW_STOCK],
    [10, STOCK_STATUS.LOW_STOCK],
    [11, STOCK_STATUS.IN_STOCK],
    [100, STOCK_STATUS.IN_STOCK],
  ])('quantity=%i -> %s', async (quantity, expectedStatus) => {
    const product = await Product.create({
      name: 'Test Product',
      category: 'Test Category',
      price: 10,
      quantity,
    });

    expect(product.stockStatus).toBe(expectedStatus);
  });

  test('stockStatus is included in JSON output and never persisted as a field', async () => {
    const product = await Product.create({
      name: 'Widget', category: 'Misc', price: 5, quantity: 3,
    });

    const json = product.toJSON();
    expect(json.stockStatus).toBe(STOCK_STATUS.LOW_STOCK);

    const raw = await mongoose.connection.collection('products').findOne({ _id: product._id });
    expect(raw.stockStatus).toBeUndefined();
  });

  test('toJSON exposes id and hides _id/__v', async () => {
    const product = await Product.create({
      name: 'Gadget', category: 'Misc', price: 5, quantity: 3,
    });
    const json = product.toJSON();
    expect(json.id).toBe(product._id.toString());
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });
});
