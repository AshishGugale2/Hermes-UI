import { baseApi } from "@/app/api";
import type { DashboardData } from "../types";

export const ipoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => "api/ipos",
      providesTags: ["Dashboard"],
    }),
    refreshDashboard: builder.mutation<DashboardData, void>({
      query: () => ({ url: "api/ipos/refresh", method: "POST" }),
      invalidatesTags: (_result, error) =>
        error ? [] : ["Dashboard", "TriggerEvents"],
    }),
  }),
});

export const { useGetDashboardQuery, useRefreshDashboardMutation } = ipoApi;
