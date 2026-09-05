const { Product, stockStatusToQuantityQuery } = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const escapeRegExp = require('../utils/escapeRegExp');

/**
 * Builds the Mongoose filter object for GET /products from validated query
 * params, translating the derived `status` filter into a `quantity` range
 * so filtering happens server-side in the query, not in application code.
 * @param {{search?: string, category?: string, status?: string}} query validated query params
 * @returns {Object} MongoDB filter
 */
function buildProductFilter({ search, category, status }) {
  const filter = {};

  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: 'i' };
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    Object.assign(filter, stockStatusToQuantityQuery(status));
  }

  return filter;
}

/**
 * POST /api/products — creates a product.
 */
async function createProduct(req, res) {
  const product = await Product.create(req.body);
  sendSuccess(res, 201, product, 'Product created successfully');
}

/**
 * GET /api/products — lists products with search, filter, sort and pagination.
 */
async function listProducts(req, res) {
  const {
    search, category, status, page, limit, sortBy, order,
  } = req.query;

  const filter = buildProductFilter({ search, category, status });
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    },
  });
}

/**
 * GET /api/products/:id — fetches a single product.
 */
async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  sendSuccess(res, 200, product);
}

/**
 * PUT /api/products/:id — replaces a product's editable fields.
 */
async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!product) throw ApiError.notFound('Product not found');
  sendSuccess(res, 200, product, 'Product updated successfully');
}

/**
 * DELETE /api/products/:id — deletes a product.
 */
async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  sendSuccess(res, 200, product, 'Product deleted successfully');
}

/**
 * PATCH /api/products/:id/quantity — sets an absolute quantity or applies a
 * relative increase/decrease. Rejects a decrease that would push quantity
 * below zero rather than silently clamping to 0.
 */
async function updateProductQuantity(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if ('quantity' in req.body) {
    product.quantity = req.body.quantity;
  } else {
    const { operation, amount } = req.body;
    if (operation === 'decrease' && amount > product.quantity) {
      throw ApiError.badRequest(
        `Cannot decrease quantity by ${amount}; only ${product.quantity} in stock`,
      );
    }
    product.quantity += operation === 'increase' ? amount : -amount;
  }

  await product.save();
  sendSuccess(res, 200, product, 'Product quantity updated successfully');
}

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductQuantity,
};
