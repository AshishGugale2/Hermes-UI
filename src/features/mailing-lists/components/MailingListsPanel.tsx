import { Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { RequestError } from "@/components/feedback/RequestError";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import {
  useCreateMailingListMutation,
  useDeleteMailingListMutation,
  useGetMailingListsQuery,
} from "../api/mailing-lists-api";

export function MailingListsPanel() {
  const query = useGetMailingListsQuery();
  const [createList, creating] = useCreateMailingListMutation();
  const [deleteList, deleting] = useDeleteMailingListMutation();
  const feedback = useActionFeedback();
  const [form, setForm] = useState({ name: "", emails: [""] });
  const busy = creating.isLoading || deleting.isLoading;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      await feedback.run(
        () =>
          createList({
            name: form.name.trim(),
            emails: form.emails
              .map((email) => email.trim())
              .filter(Boolean)
              .join(","),
          }).unwrap(),
        "Mailing list added.",
      )
    ) {
      setForm({ name: "", emails: [""] });
    }
  }

  return (
    <section className="panel-box" aria-labelledby="mailing-lists-title">
      <h2 id="mailing-lists-title">Mailing lists</h2>
      <RequestError error={query.error} onRetry={() => void query.refetch()} />
      <RequestError error={feedback.error} />
      {feedback.message && (
        <p className="notice-panel" role="status">
          {feedback.message}
        </p>
      )}
      <form onSubmit={(event) => void submit(event)} className="stack-form">
        <label>
          List name
          <input
            value={form.name}
            required
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="List name"
          />
        </label>
        <div className="email-list-inputs">
          {form.emails.map((email, index) => (
            <div key={index} className="email-row">
              <label className="email-field">
                Recipient {index + 1}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      emails: current.emails.map((value, position) =>
                        position === index ? event.target.value : value,
                      ),
                    }))
                  }
                  placeholder="ops@example.com"
                />
              </label>
              <button
                type="button"
                className="mini-icon-button"
                aria-label={`Remove recipient ${index + 1}`}
                title="Remove recipient"
                disabled={form.emails.length === 1 || busy}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    emails: current.emails.filter(
                      (_, position) => position !== index,
                    ),
                  }))
                }
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="secondary-button add-email-button"
          disabled={busy}
          onClick={() =>
            setForm((current) => ({
              ...current,
              emails: [...current.emails, ""],
            }))
          }
        >
          <Plus size={14} /> Add email
        </button>
        <button type="submit" className="primary-button" disabled={busy}>
          {creating.isLoading ? "Adding..." : "Add mailing list"}
        </button>
      </form>
      {query.isLoading && <p role="status">Loading mailing lists...</p>}
      <ul className="list-stack">
        {query.data?.map((list) => (
          <li key={list.id}>
            <div className="list-copy">
              <strong>{list.name}</strong>
              <span>{list.emails.join(", ")}</span>
            </div>
            <button
              type="button"
              className="mini-icon-button danger-inline"
              title={`Delete ${list.name}`}
              aria-label={`Delete mailing list ${list.name}`}
              disabled={busy}
              onClick={() =>
                void feedback.run(
                  () => deleteList(list.id).unwrap(),
                  "Mailing list deleted.",
                )
              }
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
      {!query.isLoading && !query.error && query.data?.length === 0 && (
        <p className="empty-copy">No mailing lists yet.</p>
      )}
    </section>
  );
}
