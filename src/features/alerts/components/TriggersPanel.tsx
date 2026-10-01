import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { RequestError } from "@/components/feedback/RequestError";
import { useMailingListSelection } from "@/features/mailing-lists/hooks/use-mailing-list-selection";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import {
  useCreateTriggerMutation,
  useDeleteTriggerMutation,
  useGetTriggersQuery,
  useToggleTriggerMutation,
} from "../api/alerts-api";
import type { TriggerOperator } from "../types";

export function TriggersPanel() {
  const query = useGetTriggersQuery();
  const lists = useMailingListSelection();
  const [createTrigger, creating] = useCreateTriggerMutation();
  const [toggleTrigger, toggling] = useToggleTriggerMutation();
  const [deleteTrigger, deleting] = useDeleteTriggerMutation();
  const feedback = useActionFeedback();
  const [form, setForm] = useState({
    name: "",
    threshold: "10",
    operator: ">" as TriggerOperator,
    description: "",
  });
  const busy = creating.isLoading || toggling.isLoading || deleting.isLoading;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lists.selectedId) return;
    if (
      await feedback.run(
        () =>
          createTrigger({
            ...form,
            name: form.name.trim(),
            threshold: Number(form.threshold),
            mailing_list_id: Number(lists.selectedId),
            active: true,
          }).unwrap(),
        "Trigger added.",
      )
    )
      setForm((current) => ({
        ...current,
        name: "",
        threshold: "10",
        description: "",
      }));
  }

  return (
    <section className="panel-box" aria-labelledby="triggers-title">
      <h2 id="triggers-title">Triggers</h2>
      <RequestError
        error={query.error || lists.error}
        onRetry={() => {
          void query.refetch();
          void lists.refetch();
        }}
      />
      <RequestError error={feedback.error} />
      {feedback.message && (
        <p className="notice-panel" role="status">
          {feedback.message}
        </p>
      )}
      <form onSubmit={(event) => void submit(event)} className="stack-form">
        <label>
          Trigger name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Trigger name"
          />
        </label>
        <div className="inline-fields">
          <label>
            Condition
            <select
              value={form.operator}
              onChange={(event) =>
                setForm({
                  ...form,
                  operator: event.target.value as TriggerOperator,
                })
              }
            >
              <option value=">">&gt; greater than</option>
              <option value=">=">&gt;= greater than or equal</option>
              <option value="<">&lt; less than</option>
              <option value="<=">&lt;= less than or equal</option>
              <option value="=">= equal to</option>
            </select>
          </label>
          <label>
            Threshold
            <input
              required
              type="number"
              min="0"
              step="0.1"
              value={form.threshold}
              onChange={(event) =>
                setForm({ ...form, threshold: event.target.value })
              }
            />
          </label>
        </div>
        <label>
          Mailing list
          <select
            value={lists.selectedId}
            required
            onChange={(event) => lists.setSelectedId(event.target.value)}
            disabled={!lists.lists.length || busy}
          >
            {!lists.lists.length && (
              <option value="">Add a mailing list first</option>
            )}
            {lists.lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <input
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Optional description"
          />
        </label>
        <button
          type="submit"
          className="primary-button"
          disabled={busy || !lists.selectedId}
        >
          {creating.isLoading ? "Adding..." : "Add trigger"}
        </button>
      </form>
      {query.isLoading && <p role="status">Loading triggers...</p>}
      <ul className="list-stack">
        {query.data?.map((trigger) => (
          <li key={trigger.id}>
            <div className="trigger-summary">
              <strong>{trigger.name}</strong>
              <span>
                {trigger.operator} {trigger.threshold.toFixed(2)}x ·{" "}
                {trigger.mailing_list_name ?? "Mailing list"}
              </span>
            </div>
            <div className="row-actions">
              <label className="trigger-switch">
                <input
                  type="checkbox"
                  role="switch"
                  checked={trigger.active}
                  aria-label={`Enable trigger ${trigger.name}`}
                  disabled={busy}
                  onChange={(event) =>
                    void feedback.run(() =>
                      toggleTrigger({
                        id: trigger.id,
                        active: event.target.checked,
                      }).unwrap(),
                    )
                  }
                />
                {trigger.active ? "Active" : "Disabled"}
              </label>
              <button
                type="button"
                className="mini-icon-button danger-inline"
                title={`Delete ${trigger.name}`}
                aria-label={`Delete trigger ${trigger.name}`}
                disabled={busy}
                onClick={() =>
                  void feedback.run(
                    () => deleteTrigger(trigger.id).unwrap(),
                    "Trigger deleted.",
                  )
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!query.isLoading && !query.error && query.data?.length === 0 && (
        <p className="empty-copy">No triggers yet.</p>
      )}
    </section>
  );
}
