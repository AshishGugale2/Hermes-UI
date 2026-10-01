import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { dashboard, mailingLists, triggers } from "./fixtures";

export const server = setupServer(
  http.get("http://localhost/api/ipos", () => HttpResponse.json(dashboard)),
  http.post("http://localhost/api/ipos/refresh", () =>
    HttpResponse.json(dashboard),
  ),
  http.get("http://localhost/api/mailing-lists", () =>
    HttpResponse.json(mailingLists),
  ),
  http.get("http://localhost/api/triggers", () => HttpResponse.json(triggers)),
  http.get("http://localhost/api/trigger-events", () => HttpResponse.json([])),
  http.get("http://localhost/api/ipo-alerts", () => HttpResponse.json([])),
);
