import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Apple, BookOpen, CalendarDays, Dumbbell, Footprints, LogOut, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useSignOut } from "@/lib/account";
import { formatIso } from "@/lib/patient-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";

const warningSigns = ["Very high thirst or frequent urination with confusion", "Blood sugar below 70 mg/dL that does not improve after a sugary snack", "Vomiting, stomach pain or fast breathing", "Sudden blurred vision, chest pain or weakness on one side", "A foot wound that is red, swollen or not healing"];

function exercise(bmi: number) {
  if (bmi < 18.5) return { title: "Gentle strength focus", body: "Light resistance work and short walks, three to four days a week. Eat regular meals before exercise." };
  if (bmi < 25) return { title: "Stay consistently active", body: "About 150 minutes of brisk walking or cycling a week, plus two short strength sessions." };
  if (bmi < 30) return { title: "Build up steadily", body: "Start with 30 minutes of brisk walking on most days, adding two strength sessions as it feels comfortable." };
  return { title: "Low-impact and regular", body: "Begin with 10 to 15 minute walks after meals, building toward 30 minutes. Choose low-impact options like swimming or cycling." };
}

export function PatientHome({ guestRecord }: { guestRecord?: { name: string; follow_up_date: string; follow_up_status: string; note: string; heightCm: number; weightKg: number } } = {}) {
  const account = useAccount(!guestRecord);
  const signOut = useSignOut();
  const [emergency, setEmergency] = useState(false);
  const [sent, setSent] = useState(false);
  const profile = account.data?.profile;
  const bmi = guestRecord ? guestRecord.heightCm > 0 && guestRecord.weightKg > 0 ? guestRecord.weightKg / Math.pow(guestRecord.heightCm / 100, 2) : null : profile?.height_cm && profile?.weight_kg ? profile.weight_kg / Math.pow(profile.height_cm / 100, 2) : null;
  const plan = bmi ? exercise(bmi) : null;

  const record = useQuery({
    queryKey: ["my-record"],
    enabled: !guestRecord,
    queryFn: async () => {
      const [p, n] = await Promise.all([
        supabase.from("patients").select("id, name, follow_up_date, follow_up_status").maybeSingle(),
        supabase.from("patient_notes").select("id, author_name, note_date, text").order("note_date", { ascending: false }),
      ]);
      return { patient: p.data, notes: n.data ?? [] };
    },
  });

  const card = (icon: React.ReactNode, title: string, body: string) => (
    <section className="panel p-5"><span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">{icon}</span><h2 className="mt-3 font-semibold text-navy">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></section>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-8">
        <span className="text-2xl font-bold text-navy">Avenn</span>
        {!guestRecord && <Button variant="outline" size="sm" onClick={signOut}><LogOut />Sign out</Button>}
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
           <div><h1 className="text-2xl font-bold text-navy">Hello, {guestRecord?.name.split(" ")[0] ?? profile?.full_name?.split(" ")[0] ?? "there"}</h1><p className="mt-1 text-sm text-muted-foreground">Your care guidance and next visit.</p></div>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => { setEmergency(true); setSent(false); }}><PhoneCall />Emergency (off-hours)</Button>
        </div>
        <section className="panel flex flex-wrap items-center gap-4 p-5">
          <span className="grid size-12 place-items-center rounded-xl bg-accent text-primary"><CalendarDays /></span>
           <div className="flex-1"><p className="text-xs text-muted-foreground">Next follow-up</p><strong className="text-lg text-navy">{guestRecord ? formatIso(guestRecord.follow_up_date) : record.data?.patient ? formatIso(record.data.patient.follow_up_date) : "—"}</strong></div>
           {(guestRecord || record.data?.patient) && <StatusBadge status={guestRecord?.follow_up_status ?? record.data?.patient?.follow_up_status ?? ""} />}
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          {card(<Apple />, "Diet", "Fill half your plate with vegetables, choose whole grains, and keep sweet drinks and refined sugar for rare occasions.")}
          {card(<Footprints />, "Lifestyle", "Keep regular meal and sleep times, check your feet daily, and take your medicines exactly as prescribed.")}
          {card(<Dumbbell />, plan ? `Exercise · ${plan.title}` : "Exercise", plan ? `${plan.body} (BMI ${bmi?.toFixed(1)})` : "Add your height and weight to get an exercise plan.")}
          {card(<BookOpen />, "General awareness", "Diabetes is manageable. Regular checkups of blood sugar, kidneys, eyes and feet prevent most complications.")}
        </div>
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-red-700"><AlertTriangle className="size-5" />Warning signs</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-900">{warningSigns.map((w) => <li key={w}>{w}</li>)}</ul>
          <p className="mt-3 text-sm font-semibold text-red-700">Please consult your doctor immediately.</p>
        </section>
        <section className="panel p-5">
          <h2 className="font-semibold text-navy">Notes from your doctor</h2>
          <div className="mt-3 divide-y divide-border/60">
             {guestRecord ? <article className="py-3"><p className="text-xs font-semibold text-primary">18 Sep 2026 · Dr. Isha Mehta</p><p className="mt-1 text-sm text-muted-foreground">{guestRecord.note}</p></article> : <>{(record.data?.notes ?? []).length === 0 && <p className="py-3 text-sm text-muted-foreground">No notes yet.</p>}{record.data?.notes.map((n) => <article key={n.id} className="py-3"><p className="text-xs font-semibold text-primary">{formatIso(n.note_date)} · {n.author_name}</p><p className="mt-1 text-sm text-muted-foreground">{n.text}</p></article>)}</>}
          </div>
        </section>
      </main>
      <Dialog open={emergency} onOpenChange={setEmergency}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Emergency (off-hours)</DialogTitle><DialogDescription>For urgent problems outside clinic hours. For life-threatening symptoms, call your local emergency number first.</DialogDescription></DialogHeader>
          {sent ? <p role="status" className="rounded-lg bg-accent p-3 text-sm text-navy">Request noted. In this prototype no real call is placed yet.</p> : <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => setSent(true)}>Contact my doctor now</Button>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
