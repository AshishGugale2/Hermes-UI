import {
  Activity,
  ArrowUpRight,
  Building2,
  CircleAlert,
  Clock3,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type IpoSubscription = {
  id: string;
  company: string;
  qib_subscription: number | null;
  nii_subscription: number | null;
  retail_subscription: number | null;
  overall_subscription: number | null;
  closing_date: string | null;
};

type MailingList = {
  id: number;
  name: string;
  emails: string[];
  created_at?: string;
};

type Trigger = {
  id: number;
  name: string;
  threshold: number;
  operator: string;
  mailing_list_id: number;
  mailing_list_name?: string;
  active: boolean;
  description?: string;
  created_at?: string;
};

type TriggerEvent = {
  id: number;
  trigger_id: number;
  ipo_id: string;
  company: string;
  trigger_threshold: number;
  operator: string;
  closing_date?: string | null;
  sent_at?: string;
  status: string;
  subject?: string;
  body?: string;
  message?: string;
};

type DashboardData = {
  source_url: string;
  fetched_at: string;
  is_stale: boolean;
  market: { is_open: boolean; label: string };
  ipos: IpoSubscription[];
};

const formatMultiple = (value: number | null) =>
  value === null ? "--" : `${value.toFixed(2)}x`;

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatClosingDate = (value: string | null) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const isClosingToday = (value: string | null) => {
  if (!value) return false;
  const today = new Date();
  const todayIso = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .slice(0, 10);
  return value === todayIso;
};

export function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "alerts">(
    "dashboard",
  );
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<TriggerEvent[]>([]);
  const [listForm, setListForm] = useState({ name: "", emails: [""] });
  const [triggerForm, setTriggerForm] = useState({
    name: "",
    threshold: "10",
    operator: ">",
    mailing_list_id: "",
    description: "",
  });
  const [pauseForm, setPauseForm] = useState({ ipo_id: "", reason: "" });
  const [emailListId, setEmailListId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const validTriggers = useMemo(
    () =>
      triggers.filter((trigger) =>
        mailingLists.some((list) => list.id === trigger.mailing_list_id),
      ),
    [mailingLists, triggers],
  );

  const addEmailField = useCallback(() => {
    setListForm((current) => ({
      ...current,
      emails: [...current.emails, ""],
    }));
  }, []);

  const updateEmailField = useCallback((index: number, value: string) => {
    setListForm((current) => ({
      ...current,
      emails: current.emails.map((email, currentIndex) =>
        currentIndex === index ? value : email,
      ),
    }));
  }, []);

  const removeEmailField = useCallback((index: number) => {
    setListForm((current) => ({
      ...current,
      emails:
        current.emails.length === 1
          ? [""]
          : current.emails.filter((_, currentIndex) => currentIndex !== index),
    }));
  }, []);

  const loadMailingConfig = useCallback(async () => {
    const [listsResponse, triggersResponse, eventsResponse] = await Promise.all(
      [
        fetch("/api/mailing-lists"),
        fetch("/api/triggers"),
        fetch("/api/trigger-events"),
      ],
    );

    if (listsResponse.ok) {
      const listData = (await listsResponse.json()) as MailingList[];
      setMailingLists(listData);
      if (listData.length > 0 && !triggerForm.mailing_list_id) {
        setTriggerForm((current) => ({
          ...current,
          mailing_list_id: String(listData[0].id),
        }));
      }
    }

    if (triggersResponse.ok) {
      setTriggers((await triggersResponse.json()) as Trigger[]);
    }

    if (eventsResponse.ok) {
      setTriggerEvents((await eventsResponse.json()) as TriggerEvent[]);
    }
  }, [triggerForm.mailing_list_id]);

  const loadDashboard = useCallback(
    async (refresh = false) => {
      setError(null);
      refresh ? setRefreshing(true) : setLoading(true);

      try {
        const response = await fetch(
          refresh ? "/api/ipos/refresh" : "/api/ipos",
          {
            method: refresh ? "POST" : "GET",
          },
        );
        const body = (await response.json()) as
          | DashboardData
          | { detail?: string };
        if (!response.ok || !("ipos" in body)) {
          throw new Error(
            "detail" in body ? body.detail : "Unable to load IPO data.",
          );
        }
        setDashboard(body);
        await loadMailingConfig();
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load IPO data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadMailingConfig],
  );

  const handleCreateList = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emails = listForm.emails
      .map((email) => email.trim())
      .filter(Boolean)
      .join(",");

    const response = await fetch("/api/mailing-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: listForm.name,
        emails,
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { detail?: string };
      setError(body.detail ?? "Unable to create mailing list.");
      return;
    }
    setListForm({ name: "", emails: [""] });
    await loadMailingConfig();
  };

  const handleCreateTrigger = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const response = await fetch("/api/triggers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: triggerForm.name,
        threshold: Number(triggerForm.threshold),
        operator: triggerForm.operator,
        mailing_list_id: Number(triggerForm.mailing_list_id),
        active: true,
        description: triggerForm.description,
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { detail?: string };
      setError(body.detail ?? "Unable to create trigger.");
      return;
    }
    setTriggerForm((current) => ({
      ...current,
      name: "",
      threshold: "10",
      description: "",
    }));
    await loadMailingConfig();
  };

  const handleToggleTrigger = async (triggerId: number, active: boolean) => {
    const response = await fetch(`/api/triggers/${triggerId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (response.ok) {
      await loadMailingConfig();
    }
  };

  const handleDeleteList = async (listId: number) => {
    const response = await fetch(`/api/mailing-lists/${listId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const body = (await response.json()) as { detail?: string };
      setError(body.detail ?? "Unable to delete mailing list.");
      return;
    }
    await loadMailingConfig();
  };

  const handleDeleteTrigger = async (triggerId: number) => {
    const response = await fetch(`/api/triggers/${triggerId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const body = (await response.json()) as { detail?: string };
      setError(body.detail ?? "Unable to delete trigger.");
      return;
    }
    await loadMailingConfig();
  };

  const handlePauseIpo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/ipo-alerts/pause", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ipo_id: pauseForm.ipo_id,
        paused: true,
        reason: pauseForm.reason,
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { detail?: string };
      setError(body.detail ?? "Unable to update IPO alert status.");
      return;
    }
    setPauseForm({ ipo_id: "", reason: "" });
    await loadMailingConfig();
  };

  const handleSendManualEmail = async (ipo: IpoSubscription) => {
    if (!mailingLists.length) {
      setError("Create a mailing list before sending an IPO email.");
      return;
    }
    const selectedListId = Number(emailListId || mailingLists[0].id);
    const response = await fetch("/api/ipos/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ipo_id: ipo.id,
        company: ipo.company,
        mailing_list_id: selectedListId,
        threshold: Number(ipo.overall_subscription ?? 0) || 1,
        operator: ">",
        closing_date: ipo.closing_date,
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { detail?: string };
      setError(body.detail ?? "Unable to send IPO email.");
      return;
    }
    setError(null);
  };

  useEffect(() => {
    void loadDashboard();
    void loadMailingConfig();
  }, [loadDashboard, loadMailingConfig]);

  const metrics = useMemo(() => {
    const ipos = dashboard?.ipos ?? [];
    const retailValues = ipos
      .map((ipo) => ipo.retail_subscription)
      .filter((value): value is number => value !== null);
    const leader = [...ipos].sort(
      (left, right) =>
        (right.overall_subscription ?? -1) - (left.overall_subscription ?? -1),
    )[0];

    return {
      total: ipos.length,
      leader,
      averageRetail:
        retailValues.length === 0
          ? null
          : retailValues.reduce((total, value) => total + value, 0) /
            retailValues.length,
    };
  }, [dashboard]);

  return (
    <div className="page-shell">
      <div className="app-frame">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Activity size={17} />
            </div>
            <div>
              <div className="brand-name">IPO Pulse</div>
              <div className="brand-caption">Subscription monitor</div>
            </div>
          </div>
          <div className="topbar-actions">
            {dashboard && (
              <div
                className={`market-status ${dashboard.market.is_open ? "open" : "closed"}`}
              >
                <span />
                {dashboard.market.label}
              </div>
            )}
            <button
              type="button"
              className="icon-button"
              onClick={() => void loadDashboard(true)}
              disabled={refreshing}
              title="Refresh subscription data"
            >
              <RefreshCw size={16} className={refreshing ? "spin" : ""} />
              <span>{refreshing ? "Refreshing" : "Refresh"}</span>
            </button>
          </div>
        </header>

        <main className="content-grid">
          <div className="tab-row">
            <button
              type="button"
              className={activeTab === "dashboard" ? "tab active" : "tab"}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={activeTab === "alerts" ? "tab active" : "tab"}
              onClick={() => setActiveTab("alerts")}
            >
              Mail alerts
            </button>
          </div>

          {activeTab === "dashboard" && (
            <>
              <section className="overview-panel">
                <div className="overview-copy">
                  <div className="eyebrow">Live subscription intelligence</div>
                  <h1>Follow the demand, without the noise.</h1>
                  <p>
                    Open IPO subscription data, refreshed on demand and captured
                    through the trading day.
                  </p>
                </div>
                <div className="refresh-summary">
                  <Clock3 size={16} />
                  <div>
                    <span>Latest snapshot</span>
                    <strong>
                      {dashboard
                        ? formatUpdatedAt(dashboard.fetched_at)
                        : "Waiting for data"}
                    </strong>
                  </div>
                </div>
              </section>

              <section
                className="stats-row"
                aria-label="IPO subscription metrics"
              >
                <Metric
                  icon={Building2}
                  label="Open IPOs"
                  value={String(metrics.total)}
                />
                <Metric
                  icon={TrendingUp}
                  label="Highest demand"
                  value={formatMultiple(
                    metrics.leader?.overall_subscription ?? null,
                  )}
                  detail={metrics.leader?.company ?? "No subscription data"}
                />
                <Metric
                  icon={Users}
                  label="Retail average"
                  value={formatMultiple(metrics.averageRetail)}
                  detail="Across listed IPOs"
                />
              </section>

              {error && (
                <section className="error-panel" role="alert">
                  <CircleAlert size={19} />
                  <div>
                    <strong>Data is unavailable</strong>
                    <span>{error}</span>
                  </div>
                  <button type="button" onClick={() => void loadDashboard()}>
                    Try again
                  </button>
                </section>
              )}

              <section className="table-panel">
                <div className="section-header">
                  <div>
                    <div className="eyebrow">Active issues</div>
                    <h2>Subscription activity</h2>
                  </div>
                  {dashboard?.is_stale && (
                    <span className="stale-notice">Showing cached data</span>
                  )}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>IPO</th>
                        <th>QIB</th>
                        <th>NII / HNI</th>
                        <th>Retail</th>
                        <th>Overall</th>
                        <th>Closing date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <LoadingRows />}
                      {!loading &&
                        dashboard?.ipos.map((ipo) => (
                          <tr
                            key={ipo.id}
                            className={
                              isClosingToday(ipo.closing_date)
                                ? "closing-today"
                                : ""
                            }
                          >
                            <td>
                              <div className="company-name">{ipo.company}</div>
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
                                  value={
                                    emailListId ||
                                    String(mailingLists[0]?.id ?? "")
                                  }
                                  onChange={(event) =>
                                    setEmailListId(event.target.value)
                                  }
                                  className="mini-select"
                                  disabled={mailingLists.length === 0}
                                >
                                  {mailingLists.length === 0 && (
                                    <option value="">No lists</option>
                                  )}
                                  {mailingLists.map((list) => (
                                    <option
                                      key={list.id}
                                      value={String(list.id)}
                                    >
                                      {list.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={() =>
                                    void handleSendManualEmail(ipo)
                                  }
                                  disabled={mailingLists.length === 0}
                                >
                                  Send email
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {!loading && !error && dashboard?.ipos.length === 0 && (
                        <tr>
                          <td colSpan={6} className="empty-state">
                            No currently open IPO subscriptions were found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="source-footer">
                <span>Source: Chittorgarh IPO subscription status</span>
                <a
                  href={dashboard?.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source <ArrowUpRight size={14} />
                </a>
              </section>
            </>
          )}

          {activeTab === "alerts" && (
            <section className="alerts-grid">
              <div className="panel-box">
                <h2>Mailing lists</h2>
                <form onSubmit={handleCreateList} className="stack-form">
                  <input
                    value={listForm.name}
                    onChange={(event) =>
                      setListForm({ ...listForm, name: event.target.value })
                    }
                    placeholder="List name"
                  />
                  <div className="email-list-inputs">
                    {listForm.emails.map((email, index) => (
                      <div key={`email-${index}`} className="email-row">
                        <input
                          value={email}
                          onChange={(event) =>
                            updateEmailField(index, event.target.value)
                          }
                          placeholder="ops@example.com"
                        />
                        <button
                          type="button"
                          className="mini-icon-button"
                          onClick={() => removeEmailField(index)}
                          aria-label="Remove email"
                          disabled={listForm.emails.length === 1}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="secondary-button add-email-button"
                    onClick={addEmailField}
                  >
                    <Plus size={14} />
                    Add email
                  </button>
                  <button type="submit" className="primary-button">
                    Add mailing list
                  </button>
                </form>
                <ul className="list-stack">
                  {mailingLists.map((list) => (
                    <li key={list.id}>
                      <div className="list-copy">
                        <strong>{list.name}</strong>
                        <span>{list.emails.join(", ")}</span>
                      </div>
                      <button
                        type="button"
                        className="secondary-button danger-inline"
                        onClick={() => void handleDeleteList(list.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel-box">
                <h2>Triggers</h2>
                <form onSubmit={handleCreateTrigger} className="stack-form">
                  <input
                    value={triggerForm.name}
                    onChange={(event) =>
                      setTriggerForm({
                        ...triggerForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Trigger name"
                  />
                  <div className="inline-fields">
                    <select
                      value={triggerForm.operator}
                      onChange={(event) =>
                        setTriggerForm({
                          ...triggerForm,
                          operator: event.target.value,
                        })
                      }
                    >
                      <option value=">">&gt; greater than</option>
                      <option value=">=">&gt;= greater than or equal</option>
                      <option value="<">&lt; less than</option>
                      <option value="<=">&lt;= less than or equal</option>
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      value={triggerForm.threshold}
                      onChange={(event) =>
                        setTriggerForm({
                          ...triggerForm,
                          threshold: event.target.value,
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                  <select
                    value={triggerForm.mailing_list_id}
                    onChange={(event) =>
                      setTriggerForm({
                        ...triggerForm,
                        mailing_list_id: event.target.value,
                      })
                    }
                  >
                    {mailingLists.length === 0 && (
                      <option value="">Add a mailing list first</option>
                    )}
                    {mailingLists.map((list) => (
                      <option key={list.id} value={String(list.id)}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={triggerForm.description}
                    onChange={(event) =>
                      setTriggerForm({
                        ...triggerForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Optional description"
                  />
                  <button type="submit" className="primary-button">
                    Add trigger
                  </button>
                </form>
                <ul className="list-stack">
                  {validTriggers.map((trigger) => (
                    <li key={trigger.id}>
                      <div className="trigger-summary">
                        <strong>{trigger.name}</strong>
                        <span>
                          {trigger.operator} {trigger.threshold.toFixed(2)}x ·{" "}
                          {trigger.mailing_list_name ?? "Mailing list"}
                        </span>
                      </div>
                      <div className="row-actions">
                        <button
                          type="button"
                          className={
                            trigger.active
                              ? "secondary-button"
                              : "secondary-button muted"
                          }
                          onClick={() =>
                            handleToggleTrigger(trigger.id, !trigger.active)
                          }
                        >
                          {trigger.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          className="secondary-button danger-inline"
                          onClick={() => void handleDeleteTrigger(trigger.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel-box">
                <h2>IPO alert controls</h2>
                <form onSubmit={handlePauseIpo} className="stack-form">
                  <input
                    value={pauseForm.ipo_id}
                    onChange={(event) =>
                      setPauseForm({ ...pauseForm, ipo_id: event.target.value })
                    }
                    placeholder="IPO ID or company slug"
                  />
                  <input
                    value={pauseForm.reason}
                    onChange={(event) =>
                      setPauseForm({ ...pauseForm, reason: event.target.value })
                    }
                    placeholder="Reason (for example: already applied)"
                  />
                  <button type="submit" className="primary-button danger">
                    Stop alerts for IPO
                  </button>
                </form>

                <ul className="list-stack compact">
                  {triggerEvents.slice(0, 8).map((event) => (
                    <li key={event.id}>
                      <strong>{event.company}</strong>
                      <span>
                        {event.operator} {event.trigger_threshold.toFixed(2)}x ·{" "}
                        {event.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={17} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </article>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <tr key={row} className="loading-row">
          <td>
            <span className="skeleton wide" />
          </td>
          <td>
            <span className="skeleton" />
          </td>
          <td>
            <span className="skeleton" />
          </td>
          <td>
            <span className="skeleton" />
          </td>
          <td>
            <span className="skeleton" />
          </td>
          <td>
            <span className="skeleton" />
          </td>
        </tr>
      ))}
    </>
  );
}
