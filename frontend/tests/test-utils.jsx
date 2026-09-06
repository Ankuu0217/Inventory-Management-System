import PropTypes from 'prop-types';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { apiSlice } from '@/api/apiSlice';

/** A fresh store per render, so cached data never leaks between tests. */
function createTestStore() {
  return configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

/** @param {{children: React.ReactNode}} props */
function AllProviders({ children }) {
  return (
    <Provider store={createTestStore()}>
      <MemoryRouter initialEntries={['/products']}>{children}</MemoryRouter>
    </Provider>
  );
}

AllProviders.propTypes = { children: PropTypes.node };

/**
 * Renders `ui` inside the Redux + Router providers the app needs.
 *
 * @param {React.ReactElement} ui
 * @returns {import('@testing-library/react').RenderResult}
 */
export function renderWithProviders(ui) {
  return render(ui, { wrapper: AllProviders });
}
