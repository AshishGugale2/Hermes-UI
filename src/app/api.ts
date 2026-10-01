import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getApiBaseUrl } from "@/config/env";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: getApiBaseUrl(), timeout: 20_000 }),
  tagTypes: [
    "Dashboard",
    "MailingLists",
    "Triggers",
    "TriggerEvents",
    "IpoNotifications",
    "MailConnection",
    "Inbox",
    "Message",
  ],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
