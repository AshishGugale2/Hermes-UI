import {
  ArrowUpRight,
  Building2,
  Clock3,
  TrendingUp,
  Users,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

import { RequestError } from "@/components/feedback/RequestError";

import { useGetDashboardQuery } from "../api/ipo-api";
import { formatMultiple, formatUpdatedAt } from "../utils/formatters";
import { Metric } from "./Metric";
import { SubscriptionTable } from "./SubscriptionTable";

export function DashboardPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const query = useGetDashboardQuery();
  const dashboard = query.data;
  const ipos = dashboard?.ipos ?? [];
  const retail = ipos
    .map((ipo) => ipo.retail_subscription)
    .filter((value): value is number => value !== null);
  const leader = [...ipos].sort(
    (left, right) =>
      (right.overall_subscription ?? -1) - (left.overall_subscription ?? -1),
  )[0];
  const average = retail.length
    ? retail.reduce((total, value) => total + value, 0) / retail.length
    : null;
  const filtered = ipos.filter((ipo) =>
    ipo.company.toLowerCase().includes(search.trim().toLowerCase()),
  );
  if (sort === "demand")
    filtered.sort(
      (left, right) =>
        (right.overall_subscription ?? -1) - (left.overall_subscription ?? -1),
    );
  if (sort === "closing")
    filtered.sort((left, right) =>
      (left.closing_date ?? "9999").localeCompare(right.closing_date ?? "9999"),
    );

  return (
    <>
      <section className="overview-panel">
        <div className="overview-copy">
          <div className="eyebrow">Market overview</div>
          <h1>IPO subscriptions</h1>
        </div>
        <div className="refresh-summary">
          <Clock3 size={16} aria-hidden="true" />
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
      <section className="stats-row" aria-label="IPO subscription metrics">
        <Metric
          icon={Building2}
          label="Open IPOs"
          value={dashboard ? String(ipos.length) : "--"}
        />
        <Metric
          icon={TrendingUp}
          label="Highest demand"
          value={formatMultiple(leader?.overall_subscription)}
          detail={leader?.company ?? "No subscription data"}
        />
        <Metric
          icon={Users}
          label="Retail average"
          value={formatMultiple(average)}
          detail="Across listed IPOs"
        />
      </section>
      <RequestError error={query.error} onRetry={() => void query.refetch()} />
      <section className="table-panel">
        <div className="section-header">
          <div>
            <div className="eyebrow">Active issues</div>
            <h2>
              Subscription activity{" "}
              <span className="count-badge">
                {dashboard ? ipos.length : "--"}
              </span>
            </h2>
          </div>
          {dashboard?.is_stale && (
            <span className="stale-notice">Showing cached data</span>
          )}
        </div>
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={14} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search IPOs"
              placeholder="Search IPOs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear IPO search"
                title="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <select
            className="sort-select"
            aria-label="Sort IPOs"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="default">Default order</option>
            <option value="demand">Highest demand</option>
            <option value="closing">Closing soonest</option>
          </select>
        </div>
        {(dashboard || query.isLoading) && (
          <SubscriptionTable
            ipos={filtered}
            loading={query.isLoading}
            emptyMessage={
              ipos.length && search.trim()
                ? "No IPOs match your search."
                : undefined
            }
          />
        )}
      </section>
      <section className="source-footer">
        <span>Source: Chittorgarh IPO subscription status</span>
        {dashboard && (
          <a href={dashboard.source_url} target="_blank" rel="noreferrer">
            View source <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </section>
    </>
  );
}
