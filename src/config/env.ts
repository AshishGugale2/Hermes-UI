export type RuntimeConfig = { apiBaseUrl?: string };

declare global {
  interface Window {
    __HERMES_CONFIG__?: RuntimeConfig;
  }
}

export function getApiBaseUrl(): string {
  const value =
    window.__HERMES_CONFIG__?.apiBaseUrl ||
    import.meta.env.VITE_API_BASE_URL ||
    "/";
  return value.endsWith("/") ? value : value + "/";
}
