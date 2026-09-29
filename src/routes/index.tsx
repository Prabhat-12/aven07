import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avenn | Connected diabetes care" },
      { name: "description", content: "Secure diabetes follow-up workspace for doctors, receptionists and patients." },
      { property: "og:title", content: "Avenn | Connected diabetes care" },
      { property: "og:description", content: "Secure diabetes follow-up workspace for doctors, receptionists and patients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => navigate({ to: data.user ? "/dashboard" : "/auth", replace: true }));
  }, [navigate]);
  return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading Avenn…</div>;
}
