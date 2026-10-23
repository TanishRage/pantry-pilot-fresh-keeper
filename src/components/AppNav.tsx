import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, CalendarDays, LayoutDashboard, LogOut, Package, Sprout, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pantry", label: "Pantry", icon: Package },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/insights", label: "Insights", icon: BarChart3 },
] as const;

export function AppNav({ email }: { email?: string | null }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 rounded-md font-display text-xl font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="size-5" aria-hidden />
            </span>
            PantryPilot
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                <l.icon className="size-4" aria-hidden />
                {l.label}
              </Link>
            ))}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Account menu">
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {email && <DropdownMenuLabel className="max-w-56 truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={signOut}>
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t bg-card md:hidden">
        <ul className="grid grid-cols-4">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground"
                activeProps={{ className: "text-primary" }}
              >
                <l.icon className="size-5" aria-hidden />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
