import { RequestError } from "@/components/feedback/RequestError";
import { formatUpdatedAt } from "@/features/ipos/utils/formatters";

import { useGetTriggerEventsQuery } from "../api/alerts-api";

export function TriggerEventHistory() {
  const query = useGetTriggerEventsQuery();
  return (
    <section className="panel-box" aria-labelledby="event-history-title">
      <h2 id="event-history-title">Recent alerts</h2>
      <RequestError error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading && <p role="status">Loading recent alerts...</p>}
      <ul className="list-stack compact">
        {query.data?.slice(0, 8).map((event) => (
          <li key={event.id}>
            <strong>{event.company}</strong>
            <span>
              {event.operator} {event.trigger_threshold.toFixed(2)}x ·{" "}
              {event.status} · {formatUpdatedAt(event.sent_at)}
            </span>
          </li>
        ))}
      </ul>
      {!query.isLoading && !query.error && query.data?.length === 0 && (
        <p className="empty-copy">No alert events yet.</p>
      )}
    </section>
  );
}
