export type IpoSubscription = {
  id: string;
  company: string;
  qib_subscription: number | null;
  nii_subscription: number | null;
  retail_subscription: number | null;
  overall_subscription: number | null;
  closing_date: string | null;
};

export type DashboardData = {
  source_url: string;
  fetched_at: string;
  is_stale: boolean;
  market: { is_open: boolean; label: string };
  ipos: IpoSubscription[];
};
