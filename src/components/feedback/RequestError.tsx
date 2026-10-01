import { CircleAlert, RefreshCw } from "lucide-react";

import { getErrorMessage } from "@/lib/api-errors";

export function RequestError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  if (!error) return null;
  return (
    <section className="error-panel" role="alert">
      <CircleAlert size={19} aria-hidden="true" />
      <div>
        <strong>Request failed</strong>
        <span>{getErrorMessage(error)}</span>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" /> Try again
        </button>
      )}
    </section>
  );
}
