import { lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";

import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";

const DashboardPage = lazy(() =>
  import("@/features/ipos").then((module) => ({
    default: module.DashboardPage,
  })),
);
const AlertsPage = lazy(() =>
  import("@/features/alerts").then((module) => ({
    default: module.AlertsPage,
  })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<WorkspaceLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route
          path="*"
          element={
            <section>
              <h1>Page not found</h1>
              <Link to="/">Return to dashboard</Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
