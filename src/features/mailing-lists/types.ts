export type MailingList = {
  id: number;
  name: string;
  emails: string[];
  created_at?: string;
};

export type CreateMailingList = { name: string; emails: string };
