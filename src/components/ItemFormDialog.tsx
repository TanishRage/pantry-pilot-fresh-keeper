import { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, STORAGES, UNITS, itemSchema, suggestExpiry, type ItemInput, type PantryItem } from "@/lib/pantry";

type FormState = { name: string; quantity: string; unit: string; category: string; storage: string; expires_at: string };
const empty: FormState = { name: "", quantity: "1", unit: "pcs", category: "produce", storage: "fridge", expires_at: "" };

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ItemFormDialog({
  open, onOpenChange, item, onSubmit, pending,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item?: PantryItem | null;
  onSubmit: (input: ItemInput) => Promise<void>;
  pending: boolean;
}) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(item ? {
      name: item.name, quantity: String(item.quantity), unit: item.unit, category: item.category,
      storage: item.storage, expires_at: item.expires_at ?? "",
    } : empty);
  }, [open, item]);

  const suggestion = useMemo(
    () => (form.expires_at ? null : suggestExpiry(form.name, form.storage as ItemInput["storage"])),
    [form.name, form.storage, form.expires_at],
  );

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = itemSchema.safeParse(form);
    if (!parsed.success) {
      const errs: typeof errors = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as keyof FormState] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    await onSubmit(parsed.data);
    onOpenChange(false);
  }

  const err = (k: keyof FormState) =>
    errors[k] ? <p id={`${k}-err`} className="text-sm text-destructive">{errors[k]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add item"}</DialogTitle>
          <DialogDescription>Track what you have so nothing gets forgotten.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={set("name")} maxLength={60} placeholder="e.g. Milk"
              aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} autoFocus />
            {err("name")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" inputMode="decimal" step="0.1" min="0.1" max="1000"
                value={form.quantity} onChange={set("quantity")}
                aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? "quantity-err" : undefined} />
              {err("quantity")}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" className={selectCls} value={form.unit} onChange={set("unit")}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="category">Category</Label>
              <select id="category" className={selectCls} value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="storage">Storage</Label>
              <select id="storage" className={selectCls} value={form.storage} onChange={set("storage")}>
                {STORAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="expires_at">Expiry date <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="expires_at" type="date" value={form.expires_at} onChange={set("expires_at")}
              aria-invalid={!!errors.expires_at} aria-describedby={errors.expires_at ? "expires_at-err" : undefined} />
            {err("expires_at")}
            {suggestion && (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
                <span className="flex items-center gap-2"><Lightbulb className="size-4" aria-hidden />Suggested: {suggestion}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, expires_at: suggestion }))}>
                  Use
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : item ? "Save changes" : "Add item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
