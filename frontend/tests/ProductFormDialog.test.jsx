import { describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { renderWithProviders } from './test-utils';

describe('ProductFormDialog (create mode)', () => {
  test('shows inline validation errors and sends no request for invalid input', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <ProductFormDialog mode="create" open onOpenChange={onOpenChange} categories={[]} />,
    );

    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('submits valid input, fires the mutation, and shows a success toast', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <>
        <Toaster />
        <ProductFormDialog mode="create" open onOpenChange={onOpenChange} categories={[]} />
      </>,
    );

    await user.type(screen.getByLabelText('Product name'), 'Desk Lamp');
    await user.type(screen.getByLabelText('Category'), 'Electronics');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(await screen.findByText('Product created')).toBeInTheDocument();
  });
});
