import DOMPurify from "dompurify";

import type { MailDetail } from "../types";

type MailViewProps = {
  mail: MailDetail | null;
};

export function MailView({ mail }: MailViewProps) {
  if (!mail) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a mail
      </div>
    );
  }

  const body = mail.body || "(No body available)";
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
  const sanitized = DOMPurify.sanitize(body, {
    ADD_TAGS: ["style"],
    ADD_ATTR: [
      "class",
      "id",
      "style",
      "width",
      "height",
      "cellspacing",
      "cellpadding",
    ],
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="border-b p-6">
        <div className="text-lg font-semibold">{mail.subject}</div>
        <div className="text-sm text-muted-foreground">{mail.fromName}</div>
        {mail.fromEmail && (
          <div className="text-xs text-muted-foreground">{mail.fromEmail}</div>
        )}
        <div className="text-xs text-muted-foreground">{mail.date}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {isHtml ? (
          <div
            className="prose prose-sm min-w-full max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        ) : (
          <div className="whitespace-pre-line text-sm">{body}</div>
        )}
      </div>
    </div>
  );
}
