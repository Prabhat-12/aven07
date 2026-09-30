import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryLayout } from "@/components/entry-layout";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Avenn" },
      { name: "description", content: "Sign in or create your Avenn account as a doctor, receptionist or patient." },
      { property: "og:title", content: "Sign in | Avenn" },
      { property: "og:description", content: "Secure access to the Avenn diabetes follow-up workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard", replace: true }); });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_IN") navigate({ to: "/dashboard", replace: true }); });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (err) setError(err.message);
      else if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };

  const google = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setError(result.error.message ?? "Google sign-in failed.");
  };

  return (
    <EntryLayout>
        <section>
          <p className="mb-3 text-xs font-bold uppercase text-foreground">Your care workspace</p>
          <h1 className="entry-heading text-3xl font-semibold text-navy">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to continue to your workspace." : "You will choose your role in the next step."}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block space-y-2"><span className="text-sm font-medium">Email</span><Input className="h-11 rounded-md bg-card" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <label className="block space-y-2"><span className="text-sm font-medium">Password</span><Input className="h-11 rounded-md bg-card" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>
            {error && <p role="alert" className="rounded-lg bg-critical-surface p-3 text-sm text-destructive">{error}</p>}
            {message && <p role="status" className="rounded-lg bg-quiet-lime p-3 text-sm text-navy">{message}</p>}
            <Button type="submit" className="h-11 w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}</Button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" className="h-11 w-full" onClick={google}>Continue with Google</Button>
          <p className="mt-5 text-center text-sm text-muted-foreground">{mode === "signin" ? "New to Avenn?" : "Already have an account?"}{" "}
            <Button type="button" variant="link" className="h-auto p-0" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>{mode === "signin" ? "Create an account" : "Sign in"}</Button></p>
        </section>
        <div className="mt-8 border-t border-border pt-6"><p className="text-sm font-semibold text-navy">Just looking around?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Explore fictional examples as a doctor, receptionist or patient. No account needed.</p><Button asChild variant="outline" className="mt-4 h-11 w-full justify-between bg-card"><Link to="/guest">Explore as guest <ArrowRight /></Link></Button></div>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-foreground" />Patient information is only shown to the people who are allowed to see it.</p>
    </EntryLayout>
  );
}
