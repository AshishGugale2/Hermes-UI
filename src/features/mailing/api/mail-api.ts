import { baseApi } from "@/app/api";
import type {
  InboxResult,
  MailConnection,
  MailConnectionResponse,
  MailDetail,
  MailDetailResponse,
  MailInboxResponse,
  MailSummary,
  MailSummaryResponse,
} from "../types";
import {
  formatDetailDate,
  formatListDate,
  parseFrom,
} from "../utils/mail-formatters";

const PAGE_SIZE = 20;

export const mailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMailConnection: builder.query<MailConnection, void>({
      query: () => "mail/connected",
      transformResponse: (response: MailConnectionResponse) => {
        const connected =
          response.connected === true || response.connected === "true";

        return {
          connected,
          email: connected ? response.email ?? null : null,
        };
      },
      providesTags: ["MailConnection"],
    }),
    getInbox: builder.query<
      InboxResult,
      { email: string; pageToken: string | null }
    >({
      query: ({ email, pageToken }) => ({
        url: "mail/inbox",
        params: {
          email,
          pageSize: PAGE_SIZE,
          ...(pageToken ? { pageToken } : {}),
        },
      }),
      transformResponse: (
        response: MailInboxResponse | MailSummaryResponse[],
      ) => {
        const rawMessages = Array.isArray(response)
          ? response
          : response.messages ?? [];

        return {
          messages: rawMessages.map(toMailSummary),
          nextPageToken: Array.isArray(response)
            ? null
            : response.nextPageToken ?? null,
        };
      },
      providesTags: ["Inbox"],
    }),
    getMessage: builder.query<
      MailDetail,
      { email: string; id: string; fallback: MailSummary }
    >({
      query: ({ email, id }) => ({
        url: "mail/message",
        params: {
          email,
          id,
        },
      }),
      transformResponse: (
        response: MailDetailResponse,
        _meta,
        { fallback },
      ) => {
        const parsed = parseFrom(response.from || fallback.fromName);

        return {
          id: response.id || fallback.id,
          fromName: parsed.name,
          fromEmail: parsed.email,
          subject: response.subject || fallback.subject,
          date: formatDetailDate(response.date || fallback.date),
          body: response.body || "",
        };
      },
      providesTags: (_result, _error, { id }) => [{ type: "Message", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInboxQuery,
  useGetMailConnectionQuery,
  useGetMessageQuery,
  useLazyGetMessageQuery,
} = mailApi;

function toMailSummary(item: MailSummaryResponse): MailSummary {
  const parsed = parseFrom(item.from || "Unknown sender");

  return {
    id: item.id || crypto.randomUUID(),
    fromName: parsed.name,
    fromEmail: parsed.email,
    subject: item.subject || "(No subject)",
    date: formatListDate(item.date || ""),
    teaser: item.teaser || item.snippet || "",
  };
}
