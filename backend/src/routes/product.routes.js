const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate');
const {
  createProductSchema,
  updateProductSchema,
  getOrDeleteProductSchema,
  updateQuantitySchema,
  listQuerySchema,
} = require('../validators/product.validator');
const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductQuantity,
} = require('../controllers/product.controller');

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, example: "6512f1e2b1e4a2a1c8d9e123" }
 *         name: { type: string, example: "Wireless Mouse" }
 *         category: { type: string, example: "Electronics" }
 *         price: { type: number, example: 25.99 }
 *         quantity: { type: integer, example: 42 }
 *         stockStatus: { type: string, enum: [In Stock, Low Stock, Out of Stock] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     ProductInput:
 *       type: object
 *       required: [name, category, price, quantity]
 *       properties:
 *         name: { type: string, example: "Wireless Mouse" }
 *         category: { type: string, example: "Electronics" }
 *         price: { type: number, example: 25.99 }
 *         quantity: { type: integer, example: 42 }
 *     ApiError:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string }
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field: { type: string }
 *               message: { type: string }
 */

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/', validate(createProductSchema), asyncHandler(createProduct));

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List products with search, filter, sort and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive partial match on name
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [inStock, lowStock, outOfStock] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated product list
 *       400:
 *         description: Bad query params
 */
router.get('/', validate(listQuerySchema), asyncHandler(listProducts));

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product found
 *       400:
 *         description: Invalid product id
 *       404:
 *         description: Product not found
 */
router.get('/:id', validate(getOrDeleteProductSchema), asyncHandler(getProduct));

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Validation failed or invalid id
 *       404:
 *         description: Product not found
 */
router.put('/:id', validate(updateProductSchema), asyncHandler(updateProduct));

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 *       400:
 *         description: Invalid product id
 *       404:
 *         description: Product not found
 */
router.delete('/:id', validate(getOrDeleteProductSchema), asyncHandler(deleteProduct));

/**
 * @openapi
 * /api/products/{id}/quantity:
 *   patch:
 *     summary: Update only a product's quantity (absolute or relative)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [quantity]
 *                 properties:
 *                   quantity: { type: integer, example: 25 }
 *               - type: object
 *                 required: [operation, amount]
 *                 properties:
 *                   operation: { type: string, enum: [increase, decrease] }
 *                   amount: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: Quantity updated
 *       400:
 *         description: Validation failed, invalid id, or decrease below zero
 *       404:
 *         description: Product not found
 */
router.patch(
  '/:id/quantity',
  validate(updateQuantitySchema),
  asyncHandler(updateProductQuantity),
);

module.exports = router;
