import { baseApi } from "@/app/api";
import type { CreateMailingList, MailingList } from "../types";

export const mailingListsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMailingLists: builder.query<MailingList[], void>({
      query: () => "api/mailing-lists",
      providesTags: ["MailingLists"],
    }),
    createMailingList: builder.mutation<MailingList, CreateMailingList>({
      query: (body) => ({ url: "api/mailing-lists", method: "POST", body }),
      invalidatesTags: (_result, error) => (error ? [] : ["MailingLists"]),
    }),
    deleteMailingList: builder.mutation<
      { id: number; deleted: boolean },
      number
    >({
      query: (id) => ({ url: `api/mailing-lists/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, error) =>
        error ? [] : ["MailingLists", "Triggers", "TriggerEvents"],
    }),
  }),
});

export const {
  useGetMailingListsQuery,
  useCreateMailingListMutation,
  useDeleteMailingListMutation,
} = mailingListsApi;
