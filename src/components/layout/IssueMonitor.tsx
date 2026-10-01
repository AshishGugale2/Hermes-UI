import { Activity, CalendarDays, Radio } from "lucide-react";

import { useGetDashboardQuery } from "@/features/ipos/api/ipo-api";
import {
  formatClosingDate,
  formatMultiple,
  isClosingToday,
} from "@/features/ipos/utils/formatters";

export function IssueMonitor() {
  const { data, isLoading, isError } = useGetDashboardQuery();
  const issues = data?.ipos ?? [];

  return (
    <aside className="issue-monitor" aria-label="IPO monitor">
      <div className="monitor-heading">
        <h2>
          <Radio size={15} aria-hidden="true" /> IPO monitor
        </h2>
        <span className="count-badge">{data ? issues.length : "--"}</span>
      </div>
      <div className="monitor-columns">
        <span>Issue</span>
        <span>Demand</span>
      </div>
      <ul className="monitor-list">
        {issues.map((ipo) => (
          <li key={ipo.id}>
            <div className="monitor-quote">
              <span>{ipo.company}</span>
              <strong
                className={
                  ipo.overall_subscription != null &&
                  ipo.overall_subscription >= 1
                    ? "subscribed"
                    : ""
                }
              >
                {formatMultiple(ipo.overall_subscription)}
              </strong>
            </div>
            <div className="monitor-date">
              <span>Closes {formatClosingDate(ipo.closing_date)}</span>
              {isClosingToday(ipo.closing_date) && (
                <span className="closing-label">Today</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!issues.length && (
        <p className="monitor-empty">
          {isLoading
            ? "Loading issues..."
            : isError
              ? "Issue data unavailable"
              : "No open issues"}
        </p>
      )}
      <div className="monitor-summary">
        <div>
          <CalendarDays size={16} aria-hidden="true" />
          <span>Closing today</span>
          <strong>
            {data
              ? issues.filter((ipo) => isClosingToday(ipo.closing_date)).length
              : "--"}
          </strong>
        </div>
        <div>
          <Activity size={16} aria-hidden="true" />
          <span>Fully subscribed</span>
          <strong>
            {data
              ? issues.filter((ipo) => (ipo.overall_subscription ?? 0) >= 1)
                  .length
              : "--"}
          </strong>
        </div>
      </div>
      <div className="monitor-footer">
        <span className="status-dot" />
        Subscription snapshot<span>IST</span>
      </div>
    </aside>
  );
}
