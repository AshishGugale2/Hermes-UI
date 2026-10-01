import { MailingListsPanel } from "@/features/mailing-lists";

import { IpoAlertControls } from "./IpoAlertControls";
import { TriggerEventHistory } from "./TriggerEventHistory";
import { TriggersPanel } from "./TriggersPanel";

export function AlertsPage() {
  return (
    <>
      <section className="overview-panel">
        <div className="overview-copy">
          <div className="eyebrow">Notifications</div>
          <h1>Mail alerts</h1>
        </div>
      </section>
      <div className="alerts-grid">
        <MailingListsPanel />
        <TriggersPanel />
        <IpoAlertControls />
        <TriggerEventHistory />
      </div>
    </>
  );
}
