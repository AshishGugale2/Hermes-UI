import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { dashboard, mailingLists } from "@/test/fixtures";
import { renderApp } from "@/test/render-app";
import { server } from "@/test/server";

describe("IPO workspace", () => {
  it("filters IPOs and restores rows when search is cleared", async () => {
    renderApp();
    const table = await screen.findByRole("table", {
      name: "IPO subscriptions",
    });
    await within(table).findByText("Example Industries");
    const user = userEvent.setup();
    await user.type(
      screen.getByRole("searchbox", { name: "Search IPOs" }),
      "no match",
    );
    expect(within(table).getByText("No IPOs match your search.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Clear IPO search" }));
    expect(within(table).getByText("Example Industries")).toBeVisible();
  });

  it("sorts by demand and closing date without mutating cached IPOs", async () => {
    server.use(
      http.get("http://localhost/api/ipos", () =>
        HttpResponse.json({
          ...dashboard,
          ipos: [
            dashboard.ipos[0],
            {
              ...dashboard.ipos[0],
              id: "ipo-2",
              company: "Second Industries",
              overall_subscription: 8,
              closing_date: "2026-10-03",
            },
          ],
        }),
      ),
    );
    renderApp();
    const table = await screen.findByRole("table", {
      name: "IPO subscriptions",
    });
    await within(table).findByText("Second Industries");
    const user = userEvent.setup();
    const sort = screen.getByRole("combobox", { name: "Sort IPOs" });
    await user.selectOptions(sort, "demand");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "Second Industries",
    );
    await user.selectOptions(sort, "closing");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "Second Industries",
    );
    await user.selectOptions(sort, "default");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent(
      "Example Industries",
    );
  });

  it("shows SMTP failures even when the HTTP request succeeds", async () => {
    server.use(
      http.post("http://localhost/api/ipos/send-email", () =>
        HttpResponse.json({
          status: "failed",
          message: "SMTP delivery failed",
          recipients: ["ops@example.com"],
        }),
      ),
    );
    renderApp();
    const button = await screen.findByRole("button", { name: "Send email" });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.setup().click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "SMTP delivery failed",
    );
    expect(screen.queryByText("Email sent.")).not.toBeInTheDocument();
  });
  it("shares one dashboard request and navigates without losing cached data", async () => {
    let requests = 0;
    server.use(
      http.get("http://localhost/api/ipos", () => {
        requests++;
        return HttpResponse.json(dashboard);
      }),
    );
    renderApp();
    const table = await screen.findByRole("table", {
      name: "IPO subscriptions",
    });
    expect(await within(table).findByText("Example Industries")).toBeVisible();
    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: "Mail alerts" }));
    expect(
      await screen.findByRole("heading", { name: "Mailing lists" }),
    ).toBeVisible();
    await user.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(
      await screen.findByRole("heading", { name: "IPO subscriptions" }),
    ).toBeVisible();
    expect(requests).toBe(1);
  });

  it("reports dashboard failures and retries", async () => {
    server.use(
      http.get("http://localhost/api/ipos", () =>
        HttpResponse.json(
          { detail: "Database temporarily unavailable" },
          { status: 503 },
        ),
      ),
    );
    renderApp();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Database temporarily unavailable",
    );
    server.use(
      http.get("http://localhost/api/ipos", () => HttpResponse.json(dashboard)),
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("table", { name: "IPO subscriptions" }),
    ).toBeVisible();
  });

  it("creates a mailing list and refreshes dependent selectors", async () => {
    let lists = [...mailingLists];
    server.use(
      http.get("http://localhost/api/mailing-lists", () =>
        HttpResponse.json(lists),
      ),
      http.post("http://localhost/api/mailing-lists", async ({ request }) => {
        const body = (await request.json()) as { name: string; emails: string };
        const list = { id: 2, name: body.name, emails: body.emails.split(",") };
        lists = [...lists, list];
        return HttpResponse.json(list);
      }),
    );
    renderApp("/alerts");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("List name"), "Investors");
    await user.type(
      screen.getByLabelText("Recipient 1"),
      "investors@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Add mailing list" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Mailing list added.",
    );
    expect(
      await screen.findByRole("option", { name: "Investors" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("List name")).toHaveValue("");
  });

  it("keeps failed form input and surfaces validation errors", async () => {
    server.use(
      http.post("http://localhost/api/mailing-lists", () =>
        HttpResponse.json({ detail: "List already exists" }, { status: 409 }),
      ),
    );
    renderApp("/alerts");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("List name"), "Duplicate");
    await user.type(screen.getByLabelText("Recipient 1"), "ops@example.com");
    await user.click(screen.getByRole("button", { name: "Add mailing list" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "List already exists",
    );
    expect(screen.getByLabelText("List name")).toHaveValue("Duplicate");
  });

  it("replaces a deleted selected list before creating a trigger", async () => {
    let lists = [
      ...mailingLists,
      { id: 2, name: "Investors", emails: ["investors@example.com"] },
    ];
    let payload: { mailing_list_id?: number } = {};
    server.use(
      http.get("http://localhost/api/mailing-lists", () =>
        HttpResponse.json(lists),
      ),
      http.delete("http://localhost/api/mailing-lists/2", () => {
        lists = lists.filter((list) => list.id !== 2);
        return HttpResponse.json({ id: 2, deleted: true });
      }),
      http.post("http://localhost/api/triggers", async ({ request }) => {
        payload = (await request.json()) as typeof payload;
        return HttpResponse.json({ id: 2, message: "Created" });
      }),
    );
    renderApp("/alerts");
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "Investors" });
    await user.selectOptions(screen.getByLabelText("Mailing list"), "2");
    await user.click(
      screen.getByRole("button", { name: "Delete mailing list Investors" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Mailing list")).toHaveValue("1"),
    );
    await user.type(screen.getByLabelText("Trigger name"), "New trigger");
    await user.click(screen.getByRole("button", { name: "Add trigger" }));
    await waitFor(() => expect(payload.mailing_list_id).toBe(1));
  });
});
