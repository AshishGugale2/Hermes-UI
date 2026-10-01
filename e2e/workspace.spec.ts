import { expect, test } from "@playwright/test";

import { dashboard, mailingLists, triggers } from "../src/test/fixtures";

test.beforeEach(async ({ page }) => {
  let lists = structuredClone(mailingLists);
  const rules = structuredClone(triggers);
  let notifications: { ipo_id: string; paused: boolean; reason: string }[] = [];
  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const method = request.method();
      const body = method === "POST" ? request.postDataJSON() : null;
      let data: unknown;
      if (path === "/api/ipos" || path === "/api/ipos/refresh")
        data = dashboard;
      else if (path === "/api/mailing-lists" && method === "POST") {
        const list = { id: 2, name: body.name, emails: body.emails.split(",") };
        lists = [...lists, list];
        data = list;
      } else if (path === "/api/mailing-lists") data = lists;
      else if (path === "/api/triggers/1/toggle") {
        rules[0].active = body.active;
        data = { id: 1, active: body.active };
      } else if (path === "/api/triggers") data = rules;
      else if (path === "/api/trigger-events") data = [];
      else if (path === "/api/ipo-alerts/pause") {
        notifications = [{ ...body, reason: body.reason ?? "" }];
        data = body;
      } else if (path === "/api/ipo-alerts") data = notifications;
      else if (path === "/api/ipos/send-email")
        data = { status: "sent", recipients: ["ops@example.com"] };
      else {
        await route.fulfill({
          status: 404,
          json: { detail: "Unexpected endpoint" },
        });
        return;
      }
      await route.fulfill({ json: data });
    },
  );
});

test("dashboard, navigation and direct route reload work without page overflow", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const table = page.getByRole("table", { name: "IPO subscriptions" });
  await expect(table.getByText("Example Industries")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "IPO subscriptions" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "Mail alerts" }).click();
  await expect(page).toHaveURL(/\/alerts$/);
  await expect(
    page.getByRole("heading", { name: "Mailing lists" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Demand alert", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("alerts.png"),
    fullPage: true,
  });
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "IPO subscriptions" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("mailing lists, trigger toggles and pause/resume remain interactive", async ({
  page,
}) => {
  await page.goto("/alerts");
  await page.getByLabel("List name").fill("Investors");
  await page
    .getByLabel("Recipient 1", { exact: true })
    .fill("investors@example.com");
  await page.getByRole("button", { name: "Add mailing list" }).click();
  await expect(page.getByRole("option", { name: "Investors" })).toBeAttached();
  const enabled = page.getByRole("switch", {
    name: "Enable trigger Demand alert",
  });
  await expect(enabled).toBeChecked();
  await enabled.click();
  await expect(enabled).not.toBeChecked();
  await page.getByLabel("IPO ID", { exact: true }).fill("ipo-1");
  await page.getByRole("button", { name: "Stop alerts for IPO" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toHaveCount(0);
});

test("refresh and manual email actions complete", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Send email", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Refresh subscription data" }).click();
  await expect(
    page.getByRole("button", { name: "Refresh subscription data" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Send email", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Email sent.");
});

test("dense issue data stays readable and supports search and sorting", async ({
  page,
}, testInfo) => {
  await page.route(
    (url) => url.pathname === "/api/ipos",
    (route) =>
      route.fulfill({
        json: {
          ...dashboard,
          ipos: [
            dashboard.ipos[0],
            {
              ...dashboard.ipos[0],
              id: "ipo-2",
              company: "Northstar Technologies",
              overall_subscription: 12.45,
              retail_subscription: 4.32,
              closing_date: "2026-10-03",
            },
            {
              ...dashboard.ipos[0],
              id: "ipo-3",
              company: "Meridian Renewable Energy and Infrastructure Limited",
              overall_subscription: 0.76,
              retail_subscription: 0.52,
            },
            {
              ...dashboard.ipos[0],
              id: "ipo-4",
              company: "Coastal Healthcare",
              overall_subscription: null,
              retail_subscription: null,
              closing_date: null,
            },
          ],
        },
      }),
  );
  await page.goto("/");
  const table = page.getByRole("table", { name: "IPO subscriptions" });
  await expect(table.getByText("Northstar Technologies")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("populated-dashboard.png"),
    fullPage: true,
  });
  await page
    .getByRole("combobox", { name: "Sort IPOs" })
    .selectOption("demand");
  await expect(table.getByRole("row").nth(1)).toContainText(
    "Northstar Technologies",
  );
  await page.getByRole("searchbox", { name: "Search IPOs" }).fill("meridian");
  await expect(table.getByRole("row")).toHaveCount(2);
  await page.getByRole("button", { name: "Clear IPO search" }).click();
  await expect(table.getByRole("row")).toHaveCount(5);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("link", { name: "Mail alerts" })).toBeVisible();
});
