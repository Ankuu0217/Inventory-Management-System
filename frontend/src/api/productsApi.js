import { apiSlice } from '@/api/apiSlice';

/**
 * Serializes list params, dropping anything empty so the URL only carries
 * filters that are actually active.
 *
 * @param {import('@/types/product').ProductListParams} params
 * @returns {string} e.g. "?search=lap&page=2"
 */
function toSearchParams(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** @returns {import('@/types/product').PaginatedResponse} */
    getProducts: builder.query({
      query: (params) => `/products${toSearchParams(params)}`,
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        Array.isArray(result?.products)
          ? [
              ...result.products.map((product) => ({ type: 'Product', id: product.id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    /** @returns {import('@/types/product').Product} */
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Dashboard',
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Dashboard',
      ],
    }),

    updateProductQuantity: builder.mutation({
      query: ({ id, body }) => ({ url: `/products/${id}/quantity`, method: 'PATCH', body }),
      transformResponse: (response) => response.data,
      /**
       * Optimistically patches the cached list so the number moves the instant
       * the button is pressed -- the most-used action in the app shouldn't wait
       * on a round trip. `patchResult.undo()` rolls it back if the request
       * fails, and the invalidation below re-syncs from the server either way.
       *
       * Only `quantity` is patched, deliberately: `stockStatus` is a rule the
       * backend owns, so the badge waits for the server's own value rather
       * than the frontend guessing at a threshold it doesn't define.
       *
       * @param {{id: string, body: import('@/types/product').QuantityUpdateInput,
       *          listParams?: import('@/types/product').ProductListParams}} arg
       */
      async onQueryStarted({ id, body, listParams }, { dispatch, queryFulfilled }) {
        if (!listParams) return;
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', listParams, (draft) => {
            const product = draft.products?.find((item) => item.id === id);
            if (!product) return;
            if (typeof body.quantity === 'number') {
              product.quantity = body.quantity;
            } else if (body.operation === 'increase') {
              product.quantity += body.amount;
            } else if (body.operation === 'decrease') {
              product.quantity = Math.max(0, product.quantity - body.amount);
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductQuantityMutation,
} = productsApi;
