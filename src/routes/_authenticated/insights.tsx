import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePantry } from "@/hooks/use-pantry";
import { computeStats, insightSummary, wasteByCategory } from "@/lib/pantry";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Insights — PantryPilot" },
      { name: "description", content: "See how much food you use versus waste, by category." },
      { property: "og:title", content: "Insights — PantryPilot" },
      { property: "og:description", content: "See how much food you use versus waste." },
    ],
  }),
  component: Insights,
});

const PIE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)"];

function Insights() {
  const { data, isLoading } = usePantry();
  const items = data ?? [];
  const s = computeStats(items);
  const bars = [
    { name: "Used", count: s.used, fill: "var(--fresh)" },
    { name: "Wasted", count: s.wasted, fill: "var(--expired)" },
  ];
  const donut = wasteByCategory(items);
  const summary = insightSummary(items);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">Insights</h1>
        <p className="mt-1 text-muted-foreground">How your kitchen is doing.</p>
      </div>
      <section className="rounded-2xl border bg-secondary p-5 text-secondary-foreground" aria-live="polite">
        <h2 className="text-lg font-semibold">Summary</h2>
        {isLoading ? <Skeleton className="mt-3 h-5 w-2/3" /> : (
          <ul className="mt-2 list-disc space-y-1 pl-5">{summary.map((l) => <li key={l}>{l}</li>)}</ul>
        )}
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Used vs wasted</h2>
          {isLoading ? <Skeleton className="mt-4 h-64" /> : s.used + s.wasted === 0 ? (
            <Empty text="Mark items as used or wasted to see this chart." />
          ) : (
            <div className="mt-4 h-64" role="img" aria-label={`Used ${s.used}, wasted ${s.wasted}`}>
              <ResponsiveContainer>
                <BarChart data={bars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                  <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {bars.map((b) => <Cell key={b.name} fill={b.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Waste by category</h2>
          {isLoading ? <Skeleton className="mt-4 h-64" /> : donut.length === 0 ? (
            <Empty text="No wasted items — nothing to show here." />
          ) : (
            <div className="mt-4 h-64" role="img" aria-label={donut.map((d) => `${d.category} ${d.count}`).join(", ")}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={donut} dataKey="count" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {donut.map((d, i) => <Cell key={d.category} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="mt-4 grid h-64 place-items-center rounded-xl bg-muted p-6 text-center text-muted-foreground">{text}</div>;
}
