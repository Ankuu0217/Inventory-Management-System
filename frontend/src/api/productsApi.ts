import { apiSlice } from '@/api/apiSlice';
import type {
  ApiEnvelope,
  PaginatedResponse,
  Product,
  ProductInput,
  ProductListParams,
  QuantityUpdateInput,
} from '@/types/product';

function toSearchParams(params: ProductListParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ProductListParams>({
      query: (params) => `/products${toSearchParams(params)}`,
      transformResponse: (response: ApiEnvelope<PaginatedResponse<Product>>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((product) => ({ type: 'Product' as const, id: product.id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ApiEnvelope<Product>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<Product, ProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      transformResponse: (response: ApiEnvelope<Product>) => response.data,
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),

    updateProduct: builder.mutation<Product, { id: string; body: ProductInput }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      transformResponse: (response: ApiEnvelope<Product>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Dashboard',
      ],
    }),

    deleteProduct: builder.mutation<Product, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      transformResponse: (response: ApiEnvelope<Product>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Dashboard',
      ],
    }),

    updateProductQuantity: builder.mutation<Product, { id: string; body: QuantityUpdateInput }>({
      query: ({ id, body }) => ({ url: `/products/${id}/quantity`, method: 'PATCH', body }),
      transformResponse: (response: ApiEnvelope<Product>) => response.data,
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
