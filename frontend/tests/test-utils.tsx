import type { ReactElement, ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { apiSlice } from '@/api/apiSlice';

function createTestStore() {
  return configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={createTestStore()}>
      <MemoryRouter initialEntries={['/products']}>{children}</MemoryRouter>
    </Provider>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AllProviders });
}
