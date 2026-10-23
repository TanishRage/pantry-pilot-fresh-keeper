import { z } from "zod";

export const UNITS = ["g", "kg", "ml", "l", "pcs"] as const;
export const CATEGORIES = ["produce", "dairy", "meat", "grains", "pantry", "frozen", "other"] as const;
export const STORAGES = ["fridge", "freezer", "shelf"] as const;
export type Unit = (typeof UNITS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Storage = (typeof STORAGES)[number];
export type ItemStatus = "active" | "used" | "wasted";

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  storage: Storage;
  added_at: string;
  expires_at: string | null;
  status: ItemStatus;
  source: "manual" | "ai";
}

export const itemSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Max 60 characters"),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .min(0.1, "At least 0.1")
    .max(1000, "At most 1000"),
  unit: z.enum(UNITS),
  category: z.enum(CATEGORIES),
  storage: z.enum(STORAGES),
  expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")
    .or(z.literal(""))
    .optional(),
});
export type ItemInput = z.infer<typeof itemSchema>;

/** Shelf life in days, keyed by storage. */
const SHELF_LIFE: Record<string, Partial<Record<Storage, number>>> = {
  milk: { fridge: 7, freezer: 90 },
  yogurt: { fridge: 14 },
  cheese: { fridge: 21, freezer: 180 },
  butter: { fridge: 30, freezer: 180 },
  eggs: { fridge: 28 },
  cream: { fridge: 7 },
  chicken: { fridge: 2, freezer: 270 },
  beef: { fridge: 3, freezer: 270 },
  "ground beef": { fridge: 2, freezer: 120 },
  pork: { fridge: 3, freezer: 180 },
  fish: { fridge: 2, freezer: 180 },
  bacon: { fridge: 7, freezer: 30 },
  bread: { shelf: 5, freezer: 90 },
  rice: { shelf: 365 },
  pasta: { shelf: 365 },
  flour: { shelf: 240 },
  oats: { shelf: 365 },
  apple: { fridge: 30, shelf: 7 },
  banana: { shelf: 5 },
  orange: { fridge: 21, shelf: 10 },
  lemon: { fridge: 21, shelf: 7 },
  berries: { fridge: 4, freezer: 240 },
  strawberries: { fridge: 4, freezer: 240 },
  grapes: { fridge: 10 },
  lettuce: { fridge: 7 },
  spinach: { fridge: 5, freezer: 240 },
  tomato: { shelf: 5, fridge: 10 },
  potato: { shelf: 30 },
  onion: { shelf: 30 },
  garlic: { shelf: 90 },
  carrot: { fridge: 21 },
  broccoli: { fridge: 5, freezer: 300 },
  cucumber: { fridge: 7 },
  avocado: { shelf: 4, fridge: 7 },
  mushrooms: { fridge: 7 },
  tofu: { fridge: 5 },
};

const CATEGORY_DEFAULT: Record<Storage, number> = { fridge: 7, freezer: 90, shelf: 30 };

/** Returns suggested shelf-life days, or null if no item matches. */
export function shelfLifeDays(name: string, storage: Storage): number | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;
  const key =
    Object.keys(SHELF_LIFE).find((k) => n === k || n === `${k}s`) ??
    Object.keys(SHELF_LIFE).find((k) => n.includes(k));
  if (!key) return null;
  const entry = SHELF_LIFE[key];
  return entry[storage] ?? CATEGORY_DEFAULT[storage];
}

export function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function suggestExpiry(name: string, storage: Storage, from = new Date()): string | null {
  const days = shelfLifeDays(name, storage);
  if (days == null) return null;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

/** Whole days until expiry (negative = past). Null if no date. */
export function daysUntil(expires: string | null, now = new Date()): number | null {
  if (!expires) return null;
  const [y, m, d] = expires.split("-").map(Number);
  const exp = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exp - today) / 86_400_000);
}

export type Freshness = "fresh" | "expiring" | "expired" | "unknown";
export function freshness(expires: string | null, now = new Date()): Freshness {
  const d = daysUntil(expires, now);
  if (d == null) return "unknown";
  if (d < 0) return "expired";
  if (d <= 3) return "expiring";
  return "fresh";
}

export function sortByExpiry<T extends { expires_at: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.expires_at && !b.expires_at) return 0;
    if (!a.expires_at) return 1;
    if (!b.expires_at) return -1;
    return a.expires_at.localeCompare(b.expires_at);
  });
}

/** Approximate weight in kg; pcs assumed 0.2 kg each. */
export function toKg(q: number, unit: Unit): number {
  switch (unit) {
    case "g":
    case "ml":
      return q / 1000;
    case "kg":
    case "l":
      return q;
    case "pcs":
      return q * 0.2;
  }
}

export interface Stats {
  active: number;
  expiringSoon: number;
  used: number;
  wasted: number;
  wasteRate: number | null;
  kgSaved: number;
}

export function computeStats(items: PantryItem[], now = new Date()): Stats {
  const active = items.filter((i) => i.status === "active");
  const used = items.filter((i) => i.status === "used");
  const wasted = items.filter((i) => i.status === "wasted").length;
  const total = used.length + wasted;
  return {
    active: active.length,
    expiringSoon: active.filter((i) => freshness(i.expires_at, now) === "expiring").length,
    used: used.length,
    wasted,
    wasteRate: total === 0 ? null : wasted / total,
    kgSaved: Math.round(used.reduce((s, i) => s + toKg(Number(i.quantity), i.unit), 0) * 10) / 10,
  };
}

export function wasteByCategory(items: PantryItem[]) {
  const map = new Map<Category, number>();
  for (const i of items) if (i.status === "wasted") map.set(i.category, (map.get(i.category) ?? 0) + 1);
  return [...map.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}

export function insightSummary(items: PantryItem[]): string[] {
  const s = computeStats(items);
  if (s.used + s.wasted === 0) {
    return ["No finished items yet. Mark items as used or wasted to start seeing insights."];
  }
  const lines: string[] = [];
  const pct = Math.round((s.wasteRate ?? 0) * 100);
  if (pct === 0) lines.push("Perfect record — nothing wasted so far. Keep it up!");
  else if (pct <= 15) lines.push(`Great job: only ${pct}% of finished items were wasted.`);
  else if (pct <= 35) lines.push(`${pct}% of finished items were wasted — there's room to improve.`);
  else lines.push(`${pct}% of finished items were wasted. Try buying smaller amounts or planning meals around what expires first.`);
  const top = wasteByCategory(items)[0];
  if (top) lines.push(`Most waste comes from ${top.category} (${top.count} item${top.count === 1 ? "" : "s"}).`);
  if (s.expiringSoon > 0) lines.push(`${s.expiringSoon} item${s.expiringSoon === 1 ? " is" : "s are"} expiring within 3 days — use them first.`);
  if (s.kgSaved > 0) lines.push(`You've used about ${s.kgSaved} kg of food instead of throwing it away.`);
  return lines;
}
