import type { MailSummary } from "../types";

type MailListProps = {
  mails: MailSummary[];
  selected: MailSummary | null;
  onSelect: (mail: MailSummary) => void;
};

export function MailList({ mails, selected, onSelect }: MailListProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r">
      {mails.map((mail) => (
        <button
          key={mail.id}
          type="button"
          onClick={() => onSelect(mail)}
          className={`border-b p-4 text-left hover:bg-accent ${
            selected?.id === mail.id ? "bg-accent" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{mail.fromName}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {mail.date}
            </span>
          </div>

          <div className="text-sm font-medium">{mail.subject}</div>

          <div className="line-clamp-2 text-xs text-muted-foreground">
            {mail.teaser}
          </div>
        </button>
      ))}
    </div>
  );
}
