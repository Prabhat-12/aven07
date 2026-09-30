import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, HeartPulse, Stethoscope, UserRound, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAccount, useSignOut, type Role } from "@/lib/account";
import { completeOnboarding } from "@/lib/onboarding.functions";
import { EntryLayout } from "@/components/entry-layout";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your account | Avenn" },
      { name: "description", content: "Choose your role and finish setting up your Avenn account." },
      { property: "og:title", content: "Set up your account | Avenn" },
      { property: "og:description", content: "Choose your role and finish setting up your Avenn account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const roles: { id: Role; title: string; note: string; icon: typeof Stethoscope }[] = [
  { id: "doctor", title: "Doctor", note: "Manage patient records, care plans and follow-ups.", icon: Stethoscope },
  { id: "receptionist", title: "Receptionist", note: "Schedule follow-ups. Sees names and dates only.", icon: ClipboardList },
  { id: "patient", title: "Patient", note: "See your follow-up, guidance and warning signs.", icon: UserRound },
];

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const account = useAccount();
  const signOut = useSignOut();
  const submit = useServerFn(completeOnboarding);
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ fullName: "", specialty: "Endocrinology", clinic: "", doctorEmail: "", uhid: "", phone: "", dob: "", height: "", weight: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => { if (account.data?.role) navigate({ to: "/dashboard", replace: true }); }, [account.data?.role, navigate]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setBusy(true); setError("");
    try {
      if (role === "doctor") await submit({ data: { role, fullName: form.fullName, specialty: form.specialty, clinic: form.clinic } });
      if (role === "receptionist") await submit({ data: { role, fullName: form.fullName, clinic: form.clinic, doctorEmail: form.doctorEmail } });
      if (role === "patient") await submit({ data: { role, fullName: form.fullName, uhid: form.uhid, phone: form.phone, dob: form.dob, heightCm: Number(form.height), weightKg: Number(form.weight) } });
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  const field = (label: string, key: keyof typeof form, props: React.ComponentProps<typeof Input> = {}) => (
    <label className="block space-y-2"><span className="text-sm font-medium">{label}</span><Input required className="h-11 rounded-md bg-card" value={form[key]} onChange={set(key)} {...props} /></label>
  );

  return (
    <EntryLayout step={role ? 2 : 1}>
        <section>
          <div className="mb-6 flex justify-end"><Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button></div>
          <h1 className="entry-heading text-3xl font-semibold text-navy">{role ? `Your ${role} details` : "How will you use Avenn?"}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Your role decides what you can see. It is saved to your account and cannot be changed from the app.</p>
          {!role ? (
            <div className="mt-8 grid gap-3">
              {roles.map(({ id, title, note, icon: Icon }) => (
                <Button key={id} type="button" variant="outline" onClick={() => setRole(id)} className="h-auto min-h-20 w-full justify-start gap-4 whitespace-normal rounded-md bg-card p-4 text-left hover:border-primary">
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-accent text-primary"><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1"><strong className="block text-navy">{title}</strong><span className="mt-1 block text-xs font-normal text-muted-foreground">{note}</span></span><ArrowRight className="size-4 text-primary" />
                </Button>
              ))}
            </div>
          ) : (
            <form onSubmit={save} className="mt-6 space-y-4">
              {field("Full name", "fullName", { autoComplete: "name" })}
              {role === "doctor" && <>{field("Specialty", "specialty")}{field("Clinic or hospital", "clinic")}</>}
              {role === "receptionist" && <>{field("Clinic or hospital", "clinic")}{field("Your doctor’s sign-up email", "doctorEmail", { type: "email" })}<p className="rounded-lg bg-accent p-3 text-sm text-navy">Your doctor must approve you before you can see the schedule.</p></>}
              {role === "patient" && <>
                <div className="grid gap-4 sm:grid-cols-2">{field("UHID (from your clinic)", "uhid", { placeholder: "e.g. SD-00421" })}{field("Phone number on record", "phone", { type: "tel" })}</div>
                <div className="grid gap-4 sm:grid-cols-3">{field("Date of birth", "dob", { type: "date" })}{field("Height (cm)", "height", { type: "number", min: 50, max: 250 })}{field("Weight (kg)", "weight", { type: "number", min: 10, max: 400 })}</div>
                <p className="flex items-center gap-2 rounded-lg bg-accent p-3 text-sm text-navy"><HeartPulse className="size-4 shrink-0 text-primary" />We match your UHID and phone number to your clinic record so nobody else can claim it.</p>
              </>}
              {error && <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"><p>{error}</p>{role === "patient" && <Button type="button" variant="outline" className="mt-3" onClick={async () => { await signOut(); navigate({ to: "/guest" }); }}>Explore as guest <ArrowRight /></Button>}</div>}
              <div className="flex justify-between gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => { setRole(null); setError(""); }}>Back</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Finish setup"}</Button></div>
            </form>
          )}
        </section>
    </EntryLayout>
  );
}
