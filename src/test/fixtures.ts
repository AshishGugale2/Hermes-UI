import type { DashboardData } from "@/features/ipos/types";
import type { MailingList } from "@/features/mailing-lists/types";
import type { Trigger } from "@/features/alerts/types";

export const dashboard: DashboardData = {
  source_url: "https://example.com/ipos",
  fetched_at: new Date().toISOString(),
  is_stale: false,
  market: { is_open: true, label: "Market day" },
  ipos: [
    {
      id: "ipo-1",
      company: "Example Industries",
      qib_subscription: 4,
      nii_subscription: 3,
      retail_subscription: 2,
      overall_subscription: 3.5,
      closing_date: "2026-10-05",
    },
  ],
};
export const mailingLists: MailingList[] = [
  { id: 1, name: "Ops", emails: ["ops@example.com"] },
];
export const triggers: Trigger[] = [
  {
    id: 1,
    name: "Demand alert",
    threshold: 3,
    operator: ">",
    mailing_list_id: 1,
    mailing_list_name: "Ops",
    active: true,
  },
];
