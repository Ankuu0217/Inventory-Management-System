import { apiSlice } from '@/api/apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** @returns {import('@/types/product').DashboardStats} */
    getDashboardStats: builder.query({
      query: () => '/dashboard',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
