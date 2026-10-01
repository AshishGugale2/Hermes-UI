import { useState } from "react";

export function useActionFeedback() {
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(
    action: () => Promise<unknown>,
    success?: string,
  ): Promise<boolean> {
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success ?? null);
      return true;
    } catch (failure) {
      setError(failure);
      return false;
    }
  }

  return { error, message, run };
}
