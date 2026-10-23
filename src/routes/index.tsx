import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PantryPilot — Waste less food" },
      { name: "description", content: "Track your pantry and use food before it expires." },
      { property: "og:title", content: "PantryPilot — Waste less food" },
      { property: "og:description", content: "Track your pantry and use food before it expires." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
