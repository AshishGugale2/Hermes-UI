export type MailSummary = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  date: string;
  teaser: string;
};

export type MailDetail = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  date: string;
  body: string;
};

export type MailConnection = {
  connected: boolean;
  email: string | null;
};

export type MailConnectionResponse = {
  connected?: boolean | string;
  email?: string;
};

export type MailSummaryResponse = {
  id?: string;
  from?: string;
  subject?: string;
  date?: string;
  teaser?: string;
  snippet?: string;
};

export type MailInboxResponse = {
  messages?: MailSummaryResponse[];
  nextPageToken?: string;
};

export type MailDetailResponse = {
  id?: string;
  from?: string;
  subject?: string;
  date?: string;
  body?: string;
};

export type InboxResult = {
  messages: MailSummary[];
  nextPageToken: string | null;
};
