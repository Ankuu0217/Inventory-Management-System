import { apiSlice } from '@/api/apiSlice';
import type { ApiEnvelope, DashboardStats } from '@/types/product';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard',
      transformResponse: (response: ApiEnvelope<DashboardStats>) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
