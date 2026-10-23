import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Leaf, Package, Recycle } from "lucide-react";
import { usePantry } from "@/hooks/use-pantry";
import { computeStats, sortByExpiry } from "@/lib/pantry";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PantryPilot" },
      { name: "description", content: "Your pantry at a glance: what's expiring and how much you've saved." },
      { property: "og:title", content: "Dashboard — PantryPilot" },
      { property: "og:description", content: "Your pantry at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error } = usePantry();
  const items = data ?? [];
  const s = computeStats(items);
  const soonest = sortByExpiry(items.filter((i) => i.status === "active" && i.expires_at)).slice(0, 5);

  const cards = [
    { label: "Expiring soon", value: s.expiringSoon, icon: AlertTriangle, tone: "bg-warning-soft text-warning-foreground" },
    { label: "Items in pantry", value: s.active, icon: Package, tone: "bg-secondary text-secondary-foreground" },
    { label: "Waste rate", value: s.wasteRate == null ? "—" : `${Math.round(s.wasteRate * 100)}%`, icon: Recycle, tone: "bg-expired-soft text-expired" },
    { label: "Kg saved", value: s.kgSaved, icon: Leaf, tone: "bg-fresh-soft text-fresh" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">Good to see you</h1>
        <p className="mt-1 text-muted-foreground">Here's what needs your attention in the kitchen.</p>
      </div>
      {error && <p role="alert" className="text-destructive">Couldn't load your pantry.</p>}
      <section aria-label="Stats" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-4 shadow-card md:p-5">
            <span className={`grid size-9 place-items-center rounded-xl ${c.tone}`}><c.icon className="size-4" aria-hidden /></span>
            {isLoading ? <Skeleton className="mt-4 h-8 w-16" /> : <p className="mt-4 text-3xl font-semibold">{c.value}</p>}
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </section>
      <section className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Use these first</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/pantry">View pantry</Link></Button>
        </div>
        {isLoading ? (
          <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : soonest.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Nothing with an expiry date yet. Add items in your pantry to see what to use first.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {soonest.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-muted-foreground">{i.quantity} {i.unit} · {i.storage}</p>
                </div>
                <FreshnessBadge expires={i.expires_at} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
