import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { usePantry, usePantryMutations } from "@/hooks/use-pantry";
import { CATEGORIES, sortByExpiry, type PantryItem } from "@/lib/pantry";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/pantry")({
  head: () => ({
    meta: [
      { title: "Pantry — PantryPilot" },
      { name: "description", content: "Everything in your kitchen, sorted by what expires first." },
      { property: "og:title", content: "Pantry — PantryPilot" },
      { property: "og:description", content: "Everything in your kitchen, sorted by what expires first." },
    ],
  }),
  component: PantryPage,
});

function PantryPage() {
  const { data, isLoading, error } = usePantry();
  const { create, update, setStatus, remove } = usePantryMutations();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PantryItem | null>(null);
  const [deleting, setDeleting] = useState<PantryItem | null>(null);

  const active = useMemo(() => (data ?? []).filter((i) => i.status === "active"), [data]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sortByExpiry(active.filter((i) => (cat === "all" || i.category === cat) && i.name.toLowerCase().includes(term)));
  }, [active, q, cat]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold md:text-4xl">Pantry</h1>
          <p className="mt-1 text-muted-foreground">{active.length} item{active.length === 1 ? "" : "s"}, soonest expiry first.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> Add item</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Search items" placeholder="Search items…" className="bg-card pl-9" value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} />
        </div>
        <select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="text-destructive">Couldn't load your pantry.</p>}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
          <h2 className="text-xl font-semibold">{active.length === 0 ? "Your pantry is empty" : "No matching items"}</h2>
          <p className="mt-2 text-muted-foreground">
            {active.length === 0 ? "Add what you bought today to start tracking expiry dates." : "Try a different search or category."}
          </p>
          {active.length === 0 && <Button className="mt-5" onClick={() => setFormOpen(true)}><Plus className="size-4" /> Add your first item</Button>}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((i) => (
            <li key={i.id} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{i.name}</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {i.quantity} {i.unit} · {i.category} · {i.storage}
                    {i.expires_at && <span className="normal-case"> · {i.expires_at}</span>}
                  </p>
                </div>
                <FreshnessBadge expires={i.expires_at} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setStatus.mutate({ id: i.id, status: "used" })}><Check className="size-4" /> Mark used</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: i.id, status: "wasted" })}><X className="size-4" /> Mark wasted</Button>
                <div className="ml-auto flex gap-1">
                  <Button size="icon" variant="ghost" aria-label={`Edit ${i.name}`} onClick={() => { setEditing(i); setFormOpen(true); }}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label={`Delete ${i.name}`} onClick={() => setDeleting(i)}><Trash2 className="size-4" /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        pending={create.isPending || update.isPending}
        onSubmit={async (input) => {
          if (editing) await update.mutateAsync({ id: editing.id, input });
          else await create.mutateAsync(input);
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This removes it permanently and it won't count toward your stats.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleting) remove.mutate(deleting.id); setDeleting(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
