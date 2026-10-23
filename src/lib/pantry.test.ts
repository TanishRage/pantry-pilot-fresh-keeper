import { describe, expect, it } from "vitest";
import { computeStats, freshness, itemSchema, suggestExpiry, type PantryItem } from "./pantry";

const now = new Date(2026, 9, 23);
const base: PantryItem = {
  id: "1", name: "x", quantity: 1, unit: "kg", category: "produce", storage: "fridge",
  added_at: "", expires_at: null, status: "active", source: "manual",
};

describe("pantry rules", () => {
  it("expiring within 3 days is amber, past is expired", () => {
    expect(freshness("2026-10-26", now)).toBe("expiring");
    expect(freshness("2026-10-27", now)).toBe("fresh");
    expect(freshness("2026-10-22", now)).toBe("expired");
  });
  it("waste rate = wasted/(used+wasted), null when none", () => {
    expect(computeStats([base], now).wasteRate).toBeNull();
    const s = computeStats([{ ...base, status: "used" }, { ...base, status: "wasted" }, { ...base, status: "wasted" }], now);
    expect(s.wasteRate).toBeCloseTo(2 / 3);
  });
  it("validates quantity range and name length", () => {
    const ok = { name: "Milk", quantity: 1, unit: "l", category: "dairy", storage: "fridge" };
    expect(itemSchema.safeParse({ ...ok, quantity: 0.05 }).success).toBe(false);
    expect(itemSchema.safeParse({ ...ok, quantity: 1001 }).success).toBe(false);
    expect(itemSchema.safeParse({ ...ok, name: "a".repeat(61) }).success).toBe(false);
    expect(itemSchema.safeParse(ok).success).toBe(true);
  });
  it("suggests milk expiry 7 days in fridge", () => {
    expect(suggestExpiry("Milk", "fridge", now)).toBe("2026-10-30");
    expect(suggestExpiry("zzz", "fridge", now)).toBeNull();
  });
});
