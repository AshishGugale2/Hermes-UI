import { Mail } from "lucide-react";

import { RequestError } from "@/components/feedback/RequestError";
import { useSendIpoEmailMutation } from "@/features/alerts/api/alerts-api";
import { useMailingListSelection } from "@/features/mailing-lists/hooks/use-mailing-list-selection";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import type { IpoSubscription } from "../types";
import {
  formatClosingDate,
  formatMultiple,
  isClosingToday,
} from "../utils/formatters";

export function SubscriptionTable({
  ipos,
  loading,
  emptyMessage = "No currently open IPO subscriptions were found.",
}: {
  ipos: IpoSubscription[];
  loading: boolean;
  emptyMessage?: string;
}) {
  const lists = useMailingListSelection();
  const [sendEmail, sending] = useSendIpoEmailMutation();
  const feedback = useActionFeedback();

  async function send(ipo: IpoSubscription) {
    await feedback.run(async () => {
      const result = await sendEmail({
        ipo_id: ipo.id,
        company: ipo.company,
        mailing_list_id: Number(lists.selectedId),
        threshold: Number(ipo.overall_subscription ?? 0) || 1,
        operator: ">",
        closing_date: ipo.closing_date,
      }).unwrap();
      if (result.status === "failed")
        throw new Error(result.message || "Email delivery failed.");
      return result;
    });
  }

  return (
    <>
      <RequestError error={lists.error} onRetry={() => void lists.refetch()} />
      <RequestError error={feedback.error} />
      {!feedback.error &&
        sending.isSuccess &&
        sending.data?.status !== "failed" && (
          <p className="notice-panel" role="status">
            {sending.data?.status === "logged"
              ? "Email logged; SMTP delivery is not configured."
              : "Email sent."}
          </p>
        )}
      <div className="table-wrap">
        <table aria-label="IPO subscriptions">
          <thead>
            <tr>
              <th>IPO</th>
              <th>QIB</th>
              <th>NII / HNI</th>
              <th>Retail</th>
              <th>Overall</th>
              <th>Closing date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              [0, 1, 2, 3].map((row) => (
                <tr
                  key={row}
                  className="loading-row"
                  aria-label="Loading subscription"
                >
                  {Array.from({ length: 7 }, (_, column) => (
                    <td key={column}>
                      <span
                        className={column === 0 ? "skeleton wide" : "skeleton"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              ipos.map((ipo) => (
                <tr
                  key={ipo.id}
                  className={
                    isClosingToday(ipo.closing_date) ? "closing-today" : ""
                  }
                >
                  <td>
                    <div className="company-name">{ipo.company}</div>
                    {isClosingToday(ipo.closing_date) && (
                      <span className="closing-label">Closes today</span>
                    )}
                  </td>
                  <td>{formatMultiple(ipo.qib_subscription)}</td>
                  <td>{formatMultiple(ipo.nii_subscription)}</td>
                  <td>{formatMultiple(ipo.retail_subscription)}</td>
                  <td className="overall-value">
                    {formatMultiple(ipo.overall_subscription)}
                  </td>
                  <td>{formatClosingDate(ipo.closing_date)}</td>
                  <td>
                    <div className="row-actions compact-actions">
                      <select
                        value={lists.selectedId}
                        onChange={(event) =>
                          lists.setSelectedId(event.target.value)
                        }
                        className="mini-select"
                        aria-label={`Mailing list for ${ipo.company}`}
                        disabled={!lists.lists.length || sending.isLoading}
                      >
                        {!lists.lists.length && (
                          <option value="">No lists</option>
                        )}
                        {lists.lists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void send(ipo)}
                        disabled={!lists.selectedId || sending.isLoading}
                        title={`Send email for ${ipo.company}`}
                      >
                        <Mail size={14} aria-hidden="true" />{" "}
                        {sending.isLoading &&
                        sending.originalArgs?.ipo_id === ipo.id
                          ? "Sending..."
                          : "Send email"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && !ipos.length && (
              <tr>
                <td colSpan={7} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
