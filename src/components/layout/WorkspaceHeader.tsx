import { Activity, RefreshCw } from "lucide-react";
import { NavLink } from "react-router-dom";

import { RequestError } from "@/components/feedback/RequestError";
import {
  useGetDashboardQuery,
  useRefreshDashboardMutation,
} from "@/features/ipos/api/ipo-api";
import { useActionFeedback } from "@/hooks/use-action-feedback";

export function WorkspaceHeader() {
  const { data } = useGetDashboardQuery();
  const [refresh, refreshing] = useRefreshDashboardMutation();
  const feedback = useActionFeedback();

  return (
    <>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Activity size={17} />
          </div>
          <div>
            <div className="brand-name">IPO Pulse</div>
            <div className="brand-caption">Hermes</div>
          </div>
        </div>
        <nav className="tab-row" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Mail alerts
          </NavLink>
        </nav>
        <div className="topbar-actions">
          {data && (
            <div
              className={`market-status ${data.market.is_open ? "open" : "closed"}`}
            >
              <span />
              {data.market.label}
            </div>
          )}
          <button
            type="button"
            className="icon-button"
            onClick={() => void feedback.run(() => refresh().unwrap())}
            disabled={refreshing.isLoading}
            title="Refresh subscription data"
            aria-label="Refresh subscription data"
          >
            <RefreshCw
              size={16}
              className={refreshing.isLoading ? "spin" : ""}
            />
          </button>
        </div>
      </header>
      {feedback.error != null && (
        <div className="header-feedback">
          <RequestError
            error={feedback.error}
            onRetry={() => void feedback.run(() => refresh().unwrap())}
          />
        </div>
      )}
    </>
  );
}
