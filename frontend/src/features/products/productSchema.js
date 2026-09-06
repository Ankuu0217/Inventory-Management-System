import { z } from 'zod';

/**
 * The single source of truth for form validation, mirroring the backend's own
 * rules exactly (see backend/src/validators/product.validator.js).
 */
export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number('Price is required').nonnegative('Price must be 0 or more'),
  quantity: z
    .number('Quantity is required')
    .nonnegative('Quantity must be 0 or more')
    .int('Quantity must be a whole number'),
});
