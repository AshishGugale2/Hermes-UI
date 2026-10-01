export type Trigger = {
  id: number;
  name: string;
  threshold: number;
  operator: TriggerOperator;
  mailing_list_id: number;
  mailing_list_name?: string;
  active: boolean;
  description?: string;
  created_at?: string;
};
export type TriggerEvent = {
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

export type TriggerOperator = ">" | ">=" | "<" | "<=" | "=" | "==";
export type CreateTrigger = {
  name: string;
  threshold: number;
  operator: TriggerOperator;
  mailing_list_id: number;
  active: boolean;
  description?: string;
};
export type IpoNotification = {
  ipo_id: string;
  paused: boolean;
  reason: string | null;
  paused_at: string | null;
  updated_at: string;
};
export type PauseIpo = { ipo_id: string; paused: boolean; reason?: string };
export type SendIpoEmail = {
  ipo_id: string;
  company: string;
  mailing_list_id: number;
  threshold: number;
  operator: TriggerOperator;
  closing_date: string | null;
};
export type EmailResult = {
  status: "sent" | "logged" | "failed";
  message?: string;
  recipients: string[];
};
