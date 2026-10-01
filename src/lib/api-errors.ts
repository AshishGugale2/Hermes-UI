export function getErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null)
    return "Unable to complete the request.";
  if ("status" in error) {
    if (error.status === "FETCH_ERROR")
      return "Cannot reach the server. Check your connection and try again.";
    if (error.status === "TIMEOUT_ERROR")
      return "The request timed out. Please try again.";
    if (
      "data" in error &&
      typeof error.data === "object" &&
      error.data !== null
    ) {
      if ("detail" in error.data) {
        if (typeof error.data.detail === "string") return error.data.detail;
        if (Array.isArray(error.data.detail)) {
          return error.data.detail
            .map((item: { msg?: string }) => item.msg || "Invalid input")
            .join(". ");
        }
      }
      if ("message" in error.data && typeof error.data.message === "string")
        return error.data.message;
    }
    return "The server could not complete the request. Please try again.";
  }
  if ("message" in error && typeof error.message === "string")
    return error.message;
  return "Unable to complete the request.";
}
