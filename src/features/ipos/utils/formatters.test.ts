import { describe, expect, it } from "vitest";

import {
  formatClosingDate,
  formatMultiple,
  formatUpdatedAt,
  isClosingToday,
} from "./formatters";

describe("market date and subscription formatting", () => {
  it("uses India's calendar date across UTC midnight", () => {
    expect(isClosingToday("2026-10-02", new Date("2026-10-01T20:00:00Z"))).toBe(
      true,
    );
    expect(isClosingToday("2026-10-01", new Date("2026-10-01T20:00:00Z"))).toBe(
      false,
    );
  });
  it("handles missing or malformed data without throwing", () => {
    expect(formatMultiple(null)).toBe("--");
    expect(formatMultiple(3.5)).toBe("3.50x");
    expect(formatClosingDate("invalid")).toBe("--");
    expect(formatUpdatedAt("invalid")).toBe("--");
  });
});
