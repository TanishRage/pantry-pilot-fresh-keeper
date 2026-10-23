import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Meal Planner — PantryPilot" },
      { name: "description", content: "Plan meals around what's about to expire. Coming next." },
      { property: "og:title", content: "Meal Planner — PantryPilot" },
      { property: "og:description", content: "Plan meals around what's about to expire." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed bg-card p-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <CalendarDays className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-semibold">Meal planner</h1>
      <p className="mt-2 text-muted-foreground">Coming next: weekly meal plans built from what's expiring first.</p>
    </div>
  ),
});
