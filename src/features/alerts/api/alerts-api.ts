import { baseApi } from "@/app/api";
import type {
  CreateTrigger,
  EmailResult,
  IpoNotification,
  PauseIpo,
  SendIpoEmail,
  Trigger,
  TriggerEvent,
} from "../types";

export const alertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTriggers: builder.query<Trigger[], void>({
      query: () => "api/triggers",
      providesTags: ["Triggers"],
    }),
    createTrigger: builder.mutation<
      { id: number; message: string },
      CreateTrigger
    >({
      query: (body) => ({ url: "api/triggers", method: "POST", body }),
      invalidatesTags: (_result, error) => (error ? [] : ["Triggers"]),
    }),
    toggleTrigger: builder.mutation<
      { id: number; active: boolean },
      { id: number; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: `api/triggers/${id}/toggle`,
        method: "POST",
        body: { active },
      }),
      invalidatesTags: (_result, error) => (error ? [] : ["Triggers"]),
    }),
    deleteTrigger: builder.mutation<{ id: number; deleted: boolean }, number>({
      query: (id) => ({ url: `api/triggers/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, error) =>
        error ? [] : ["Triggers", "TriggerEvents"],
    }),
    getTriggerEvents: builder.query<TriggerEvent[], void>({
      query: () => "api/trigger-events",
      providesTags: ["TriggerEvents"],
    }),
    getIpoNotifications: builder.query<IpoNotification[], void>({
      query: () => "api/ipo-alerts",
      providesTags: ["IpoNotifications"],
    }),
    pauseIpo: builder.mutation<PauseIpo, PauseIpo>({
      query: (body) => ({ url: "api/ipo-alerts/pause", method: "POST", body }),
      invalidatesTags: (_result, error) => (error ? [] : ["IpoNotifications"]),
    }),
    sendIpoEmail: builder.mutation<EmailResult, SendIpoEmail>({
      query: (body) => ({ url: "api/ipos/send-email", method: "POST", body }),
    }),
  }),
});

export const {
  useGetTriggersQuery,
  useCreateTriggerMutation,
  useToggleTriggerMutation,
  useDeleteTriggerMutation,
  useGetTriggerEventsQuery,
  useGetIpoNotificationsQuery,
  usePauseIpoMutation,
  useSendIpoEmailMutation,
} = alertsApi;
