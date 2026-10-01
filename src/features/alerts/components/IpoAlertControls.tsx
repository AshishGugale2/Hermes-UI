import { Play, Pause } from "lucide-react";
import { useState, type FormEvent } from "react";

import { RequestError } from "@/components/feedback/RequestError";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import {
  useGetIpoNotificationsQuery,
  usePauseIpoMutation,
} from "../api/alerts-api";

export function IpoAlertControls() {
  const query = useGetIpoNotificationsQuery();
  const [pauseIpo, pausing] = usePauseIpoMutation();
  const feedback = useActionFeedback();
  const [form, setForm] = useState({ ipo_id: "", reason: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      await feedback.run(
        () =>
          pauseIpo({
            ...form,
            ipo_id: form.ipo_id.trim(),
            paused: true,
          }).unwrap(),
        "IPO alerts paused.",
      )
    ) {
      setForm({ ipo_id: "", reason: "" });
    }
  }

  return (
    <section className="panel-box" aria-labelledby="ipo-controls-title">
      <h2 id="ipo-controls-title">IPO alert controls</h2>
      <RequestError error={query.error} onRetry={() => void query.refetch()} />
      <RequestError error={feedback.error} />
      {feedback.message && (
        <p className="notice-panel" role="status">
          {feedback.message}
        </p>
      )}
      <form onSubmit={(event) => void submit(event)} className="stack-form">
        <label>
          IPO ID
          <input
            required
            value={form.ipo_id}
            onChange={(event) =>
              setForm({ ...form, ipo_id: event.target.value })
            }
            placeholder="IPO ID or company slug"
          />
        </label>
        <label>
          Reason
          <input
            value={form.reason}
            onChange={(event) =>
              setForm({ ...form, reason: event.target.value })
            }
            placeholder="Reason (for example: already applied)"
          />
        </label>
        <button
          type="submit"
          className="primary-button danger"
          disabled={pausing.isLoading}
        >
          <Pause size={14} />{" "}
          {pausing.isLoading ? "Updating..." : "Stop alerts for IPO"}
        </button>
      </form>
      {query.isLoading && <p role="status">Loading IPO alert settings...</p>}
      <ul className="list-stack">
        {query.data
          ?.filter((item) => item.paused)
          .map((item) => (
            <li key={item.ipo_id}>
              <div className="list-copy">
                <strong>{item.ipo_id}</strong>
                <span>{item.reason || "Paused"}</span>
              </div>
              <button
                type="button"
                className="secondary-button"
                disabled={pausing.isLoading}
                onClick={() =>
                  void feedback.run(
                    () =>
                      pauseIpo({ ipo_id: item.ipo_id, paused: false }).unwrap(),
                    "IPO alerts resumed.",
                  )
                }
              >
                <Play size={14} /> Resume
              </button>
            </li>
          ))}
      </ul>
    </section>
  );
}
