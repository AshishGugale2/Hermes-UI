import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useState } from "react";

import {
  useGetInboxQuery,
  useGetMailConnectionQuery,
  useGetMessageQuery,
} from "../api/mail-api";
import type { MailSummary } from "../types";
import { MailList } from "./MailList";
import { MailView } from "./MailView";

export function MailingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([]);

  const connectionQuery = useGetMailConnectionQuery();
  const connectedEmail = connectionQuery.data?.email ?? null;

  const inboxQuery = useGetInboxQuery(
    connectedEmail
      ? {
          email: connectedEmail,
          pageToken: currentPageToken,
        }
      : skipToken,
  );

  const mails = inboxQuery.data?.messages ?? [];
  const selectedSummary =
    mails.find((mail) => mail.id === selectedId) ?? mails[0] ?? null;
  const connectionExpired =
    isUnauthorized(inboxQuery.error) || isUnauthorized(connectionQuery.error);
  const effectiveConnectedEmail = connectionExpired ? null : connectedEmail;

  const messageQuery = useGetMessageQuery(
    effectiveConnectedEmail && selectedSummary
      ? {
          email: effectiveConnectedEmail,
          id: selectedSummary.id,
          fallback: selectedSummary,
        }
      : skipToken,
  );

  const loadingInbox = connectionQuery.isLoading || inboxQuery.isFetching;
  const loadingMessage = messageQuery.isFetching;
  const nextPageToken = inboxQuery.data?.nextPageToken ?? null;
  const error =
    getQueryErrorMessage(connectionQuery.error) ??
    getQueryErrorMessage(inboxQuery.error) ??
    getQueryErrorMessage(messageQuery.error);

  const handleSelect = (mail: MailSummary) => {
    setSelectedId(mail.id);
  };

  const connectGmail = () => {
    window.location.href = "/auth/google";
  };

  const handleNextPage = () => {
    if (!nextPageToken) {
      return;
    }

    setSelectedId(null);
    setPageHistory((history) => [...history, currentPageToken]);
    setCurrentPageToken(nextPageToken);
  };

  const handlePrevPage = () => {
    setSelectedId(null);
    setPageHistory((history) => {
      if (history.length === 0) {
        return history;
      }

      const previous = history[history.length - 1];
      setCurrentPageToken(previous);
      return history.slice(0, -1);
    });
  };

  if (!effectiveConnectedEmail) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="rounded-2xl border bg-background p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Connect your Gmail account</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with Google so the app can load your inbox.
          </p>
          <button
            type="button"
            onClick={connectGmail}
            className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Connect Gmail
          </button>
          {loadingInbox && (
            <p className="mt-3 text-sm text-muted-foreground">
              Checking connection...
            </p>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex w-[320px] flex-col border-r">
        <div className="border-b px-4 py-3">
          <div className="text-sm text-muted-foreground">Connected as</div>
          <div className="font-medium">{effectiveConnectedEmail}</div>
        </div>
        <MailList
          mails={mails}
          selected={selectedSummary}
          onSelect={handleSelect}
        />
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={pageHistory.length === 0}
            className="rounded-full border px-3 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {pageHistory.length + 1}</span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!nextPageToken}
            className="rounded-full border px-3 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {(loadingInbox || loadingMessage) && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
        {error && (
          <div className="flex h-full items-center justify-center text-destructive">
            {error}
          </div>
        )}
        {!error && !loadingInbox && !loadingMessage && (
          <MailView mail={messageQuery.data ?? null} />
        )}
      </div>
    </div>
  );
}

function isUnauthorized(error: unknown) {
  return isFetchBaseQueryError(error) && error.status === 401;
}

function getQueryErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  if (!isFetchBaseQueryError(error)) {
    return "Unable to complete request.";
  }

  if (error.status === 401) {
    return "Gmail connection expired. Reconnect Gmail account.";
  }

  if (typeof error.data === "string" && error.data.trim()) {
    return error.data;
  }

  if (isErrorData(error.data)) {
    return error.data.message || error.data.error;
  }

  return "Unable to complete request.";
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

function isErrorData(data: unknown): data is { message?: string; error?: string } {
  return typeof data === "object" && data !== null;
}
