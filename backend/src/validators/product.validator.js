const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid product id'),
});

const nameSchema = z.string().trim().min(1, 'Name is required');
const categorySchema = z.string().trim().min(1, 'Category is required');
const priceSchema = z.coerce.number('Price is required').nonnegative('Price must be >= 0');
const quantitySchema = z.coerce
  .number('Quantity is required')
  .nonnegative('Quantity must be >= 0')
  .int('Quantity must be an integer');

const createProductSchema = z.object({
  body: z.object({
    name: nameSchema,
    category: categorySchema,
    price: priceSchema,
    quantity: quantitySchema,
  }),
});

const updateProductSchema = z.object({
  params: idParamSchema,
  body: z.object({
    name: nameSchema,
    category: categorySchema,
    price: priceSchema,
    quantity: quantitySchema,
  }),
});

const getOrDeleteProductSchema = z.object({
  params: idParamSchema,
});

const updateQuantitySchema = z.object({
  params: idParamSchema,
  body: z.union([
    z.object({
      quantity: quantitySchema,
    }),
    z.object({
      operation: z.enum(['increase', 'decrease'], 'operation must be "increase" or "decrease"'),
      amount: z.coerce.number('Amount is required').positive('Amount must be > 0').int('Amount must be an integer'),
    }),
  ]),
});

const listQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    status: z.enum(['inStock', 'lowStock', 'outOfStock']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(['name', 'category', 'price', 'quantity', 'createdAt', 'updatedAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  getOrDeleteProductSchema,
  updateQuantitySchema,
  listQuerySchema,
};
