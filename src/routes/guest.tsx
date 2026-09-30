import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, LogOut, Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryLayout } from "@/components/entry-layout";
import { guestDefaults, guestPatients } from "@/lib/guest-data";
import type { Patient } from "@/lib/patient-types";
import type { Role } from "@/lib/account";
import type { WorkspacePage } from "@/components/avenn-dashboard";
import { supabase } from "@/integrations/supabase/client";

const GuestDoctorDashboard = lazy(() => import("@/components/avenn-dashboard").then((m) => ({ default: m.GuestDoctorDashboard })));
const ReceptionistView = lazy(() => import("@/components/receptionist-view").then((m) => ({ default: m.ReceptionistView })));
const PatientHome = lazy(() => import("@/components/patient-home").then((m) => ({ default: m.PatientHome })));

export const Route = createFileRoute("/guest")({
  head: () => ({ meta: [
    { title: "Guest preview | Avenn" },
    { name: "description", content: "Explore fictional doctor, receptionist and patient workflows in Avenn without an account." },
    { property: "og:title", content: "Guest preview | Avenn" },
    { property: "og:description", content: "Explore fictional care workflows in an isolated Avenn guest preview." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Guest,
});

const roles = [
  { id: "doctor", title: "Doctor", description: "Review trends, care plans, follow-ups and messages.", icon: Stethoscope },
  { id: "receptionist", title: "Receptionist", description: "Coordinate appointments with a schedule-only view.", icon: ClipboardList },
  { id: "patient", title: "Patient", description: "See your follow-up, guidance and shared notes.", icon: UserRound },
] as const;

function Guest() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) navigate({ to: "/dashboard", replace: true });
      else setChecked(true);
    });
    return () => { active = false; };
  }, [navigate]);
  const [role, setRole] = useState<Role | null>(null);
  const [entered, setEntered] = useState(false);
  const [form, setForm] = useState(guestDefaults.patient);
  const [patients, setPatients] = useState<Patient[]>(() => structuredClone(guestPatients));
  const [page, setPage] = useState<WorkspacePage>("dashboard");
  const choose = (next: Role) => { setRole(next); setForm(guestDefaults[next]); setEntered(false); setPage("dashboard"); };
  const exit = () => { setPatients(structuredClone(guestPatients)); navigate({ to: "/auth" }); };

  if (!checked) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Opening Avenn…</div>;

  if (entered && role) {
    const record = patients[0];
    const schedule = patients.map((p) => ({ id: p.id, name: p.name, follow_up_date: p.followUpIso, follow_up_status: p.followUpStatus, appointment_status: p.appointmentStatus ?? "Scheduled", appointment_time: p.slot, contact_phone: "Not available in guest preview" }));
    return <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-quiet-lime px-4 py-2 text-sm sm:px-8">
        <div><strong className="text-navy">Guest preview · {roles.find((r) => r.id === role)?.title}</strong><span className="ml-2 hidden text-muted-foreground sm:inline">Fictional examples; changes reset when you leave.</span></div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setEntered(false)}><ArrowLeft />Details</Button><Button variant="outline" size="sm" onClick={() => { setEntered(false); setRole(null); }}><UserRound />Switch role</Button><Button variant="ghost" size="sm" onClick={exit}><LogOut />Exit</Button></div>
      </div>
      <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-muted-foreground">Opening preview…</div>}>
        {role === "doctor" && <GuestDoctorDashboard patients={patients} page={page} onPageChange={setPage} onPatientsChange={setPatients} name={form.fullName} specialty={form.specialty} />}
        {role === "receptionist" && <ReceptionistView guestRows={schedule} guestName={form.fullName} onGuestRowsChange={(rows) => setPatients((current) => current.map((p) => { const row = rows.find((r) => r.id === p.id); return row ? { ...p, followUpIso: row.follow_up_date ?? "", followUpStatus: row.follow_up_status, appointmentStatus: row.appointment_status } : p; }))} />}
        {role === "patient" && record && <PatientHome guest={{ name: form.fullName, heightCm: Number(form.height), weightKg: Number(form.weight), patient: record, onChange: (next) => setPatients((current) => current.map((p) => (p.id === next.id ? next : p))) }} />}
      </Suspense>
    </div>;
  }

  const field = (label: string, key: keyof typeof form, type = "text") => <label className="block space-y-2"><span className="text-sm font-medium text-navy">{label}</span><Input required type={type} className="h-11 rounded-md bg-card" value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></label>;
  return <EntryLayout step={role ? 2 : 1} guest>
    <div className="mb-7 flex items-center justify-between gap-3"><span className="rounded-md border border-primary/20 bg-quiet-lime px-3 py-1 text-xs font-semibold text-foreground">Guest preview</span><Button size="sm" variant="ghost" onClick={exit}>Exit preview <ArrowRight /></Button></div>
    <h1 className="entry-heading text-3xl font-semibold text-navy">{role ? `Your ${role} details` : "How would you like to explore?"}</h1>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{role ? "These fictional details are filled in for you. You can edit them before entering the sample workspace." : "Choose a perspective. You can explore another one at any time."}</p>
    {!role ? <div className="mt-8 grid gap-3">{roles.map(({ id, title, description, icon: Icon }) => <Button key={id} variant="outline" className="h-auto min-h-20 w-full justify-start gap-4 whitespace-normal rounded-md border-border bg-card p-4 text-left shadow-sm hover:border-primary" onClick={() => choose(id)}><span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-foreground"><Icon /></span><span className="min-w-0 flex-1"><strong className="block text-navy">{title}</strong><span className="mt-1 block text-xs font-normal text-muted-foreground">{description}</span></span><ArrowRight className="size-4 text-foreground" /></Button>)}</div> :
      <form className="mt-8 space-y-5" onSubmit={(event) => { event.preventDefault(); setEntered(true); }}>
        {field("Full name", "fullName")}
        {role === "doctor" && <div className="grid gap-4 sm:grid-cols-2">{field("Specialty", "specialty")}{field("Clinic or hospital", "clinic")}</div>}
        {role === "receptionist" && <>{field("Clinic or hospital", "clinic")}{field("Doctor’s sign-up email", "doctorEmail", "email")}</>}
        {role === "patient" && <><div className="grid gap-4 sm:grid-cols-2">{field("UHID", "uhid")}{field("Phone number", "phone", "tel")}</div><div className="grid gap-4 sm:grid-cols-3">{field("Date of birth", "dob", "date")}{field("Height (cm)", "height", "number")}{field("Weight (kg)", "weight", "number")}</div></>}
        <div className="rounded-md border border-primary/20 bg-quiet-lime px-4 py-3 text-xs leading-5 text-navy">This sample information is not connected to any clinic account or patient record.</div>
        <div className="flex items-center justify-between gap-3 pt-3"><Button variant="ghost" type="button" onClick={() => setRole(null)}><ArrowLeft />Back</Button><Button type="submit" className="h-11 px-6">Explore {role} view <ArrowRight /></Button></div>
      </form>}
  </EntryLayout>;
}
