import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — PantryPilot" },
      { name: "description", content: "Sign in to PantryPilot to track your pantry and reduce food waste." },
      { property: "og:title", content: "Sign in — PantryPilot" },
      { property: "og:description", content: "Sign in to PantryPilot to track your pantry and reduce food waste." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function signIn() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setLoading(false);
      toast.error("Sign-in failed", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Sprout className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">PantryPilot</h1>
        <p className="mt-2 text-muted-foreground">Know what's in your kitchen. Use it before it goes bad.</p>
        <Button size="lg" className="mt-8 w-full" onClick={signIn} disabled={loading}>
          {loading ? "Opening Google…" : "Continue with Google"}
        </Button>
      </div>
    </main>
  );
}
