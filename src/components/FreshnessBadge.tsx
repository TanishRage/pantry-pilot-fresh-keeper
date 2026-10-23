import { daysUntil, freshness } from "@/lib/pantry";
import { cn } from "@/lib/utils";

const styles = {
  fresh: "bg-fresh-soft text-fresh",
  expiring: "bg-warning-soft text-warning-foreground",
  expired: "bg-expired-soft text-expired",
  unknown: "bg-muted text-muted-foreground",
};

export function FreshnessBadge({ expires }: { expires: string | null }) {
  const f = freshness(expires);
  const d = daysUntil(expires);
  const label =
    f === "unknown" ? "No date"
    : f === "expired" ? `Expired${d === -1 ? " yesterday" : ` ${-d!}d ago`}`
    : f === "expiring" ? (d === 0 ? "Expires today" : `Expires in ${d}d`)
    : "Fresh";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", styles[f])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
