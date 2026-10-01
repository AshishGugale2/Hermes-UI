import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { WorkspaceHeader } from "./WorkspaceHeader";
import { IssueMonitor } from "./IssueMonitor";

export function WorkspaceLayout() {
  return (
    <div className="page-shell">
      <div className="app-frame">
        <WorkspaceHeader />
        <div className="workspace-body">
          <IssueMonitor />
          <main className="content-grid">
            <Suspense fallback={<p role="status">Loading page...</p>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
