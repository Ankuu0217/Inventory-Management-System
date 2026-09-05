import { describe, expect, test } from 'vitest';
import { productSchema } from '@/features/products/productSchema';

const validInput = { name: 'Wireless Mouse', category: 'Electronics', price: 25.99, quantity: 10 };

describe('productSchema', () => {
  test('accepts valid input', () => {
    expect(productSchema.safeParse(validInput).success).toBe(true);
  });

  test('rejects a missing name', () => {
    const result = productSchema.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(false);
  });

  test('rejects a missing category', () => {
    const result = productSchema.safeParse({ ...validInput, category: '' });
    expect(result.success).toBe(false);
  });

  test('rejects a negative price', () => {
    const result = productSchema.safeParse({ ...validInput, price: -1 });
    expect(result.success).toBe(false);
  });

  test('rejects a negative quantity', () => {
    const result = productSchema.safeParse({ ...validInput, quantity: -1 });
    expect(result.success).toBe(false);
  });

  test('rejects a non-integer quantity', () => {
    const result = productSchema.safeParse({ ...validInput, quantity: 1.5 });
    expect(result.success).toBe(false);
  });
});
