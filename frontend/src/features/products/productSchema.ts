import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number('Price is required').nonnegative('Price must be >= 0'),
  quantity: z
    .number('Quantity is required')
    .nonnegative('Quantity must be >= 0')
    .int('Quantity must be a whole number'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
