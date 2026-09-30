import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Apple, BookOpen, CalendarDays, Check, CircleAlert, CircleDashed, Clock, Dumbbell, Footprints, LogOut, PhoneCall, Loader } from "lucide-react";
import { useAccount, useSignOut } from "@/lib/account";
import { CHECKIN_OPTIONS, progressOf, taskState, type CareTask, type CheckIn } from "@/lib/care-loop";
import { loadMyCare, setTaskStatus, submitCheckIn } from "@/lib/patient-care";
import { formatIso, type Patient } from "@/lib/patient-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";

const warningSigns = ["Very high thirst or frequent urination with confusion", "Blood sugar below 70 mg/dL that does not improve after a sugary snack", "Vomiting, stomach pain or fast breathing", "Sudden blurred vision, chest pain or weakness on one side", "A foot wound that is red, swollen or not healing"];
const tabs = ["Home", "My care", "Appointments", "Notes"] as const;
type Tab = (typeof tabs)[number];

function exercise(bmi: number) {
  if (bmi < 18.5) return { title: "Gentle strength focus", body: "Light resistance work and short walks, three to four days a week. Eat regular meals before exercise." };
  if (bmi < 25) return { title: "Stay consistently active", body: "About 150 minutes of brisk walking or cycling a week, plus two short strength sessions." };
  if (bmi < 30) return { title: "Build up steadily", body: "Start with 30 minutes of brisk walking on most days, adding two strength sessions as it feels comfortable." };
  return { title: "Low-impact and regular", body: "Begin with 10 to 15 minute walks after meals, building toward 30 minutes. Choose low-impact options like swimming or cycling." };
}

type GuestProps = { name: string; heightCm: number; weightKg: number; patient: Patient; onChange: (patient: Patient) => void };
type View = { patientId: string; name: string; followIso: string | null; followStatus: string; apptStatus: string; tasks: CareTask[]; checkins: CheckIn[]; notes: { id: string; author: string; date: string; text: string }[] };

const stateIcon = { done: Check, active: Loader, due: Clock, overdue: CircleAlert, idle: CircleDashed } as const;

export function PatientHome({ guest }: { guest?: GuestProps } = {}) {
  const account = useAccount(!guest);
  const signOut = useSignOut();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("Home");
  const [emergency, setEmergency] = useState(false);
  const [sent, setSent] = useState(false);
  const [checkStatus, setCheckStatus] = useState<string>("");
  const [checkText, setCheckText] = useState("");
  const [feedback, setFeedback] = useState("");
  const profile = account.data?.profile;

  const record = useQuery({ queryKey: ["my-care"], enabled: !guest, queryFn: loadMyCare });

  const view: View | null = guest
    ? { patientId: guest.patient.dbId, name: guest.name || guest.patient.name, followIso: guest.patient.followUpIso, followStatus: guest.patient.followUpStatus, apptStatus: guest.patient.appointmentStatus ?? "Scheduled", tasks: guest.patient.careTasks ?? [], checkins: guest.patient.checkins ?? [], notes: guest.patient.notes.map((n, i) => ({ id: String(i), author: n.author, date: n.date, text: n.text })) }
    : record.data?.patient
      ? { patientId: record.data.patient.id, name: profile?.full_name ?? record.data.patient.name, followIso: record.data.patient.follow_up_date, followStatus: record.data.patient.follow_up_status, apptStatus: record.data.patient.appointment_status, tasks: record.data.tasks, checkins: record.data.checkins, notes: record.data.notes.map((n) => ({ id: n.id, author: n.author_name, date: formatIso(n.note_date), text: n.text })) }
      : null;

  const heightCm = guest ? guest.heightCm : profile?.height_cm ?? 0;
  const weightKg = guest ? guest.weightKg : profile?.weight_kg ?? 0;
  const bmi = heightCm > 0 && weightKg > 0 ? weightKg / Math.pow(heightCm / 100, 2) : null;
  const plan = bmi ? exercise(bmi) : null;

  const toggleTask = useMutation({
    mutationFn: async (task: CareTask) => {
      const next = task.status === "Completed" ? "Not started" : "Completed";
      if (guest) guest.onChange({ ...guest.patient, careTasks: (guest.patient.careTasks ?? []).map((t) => (t.id === task.id ? { ...t, status: next } : t)) });
      else await setTaskStatus(task.id, next);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-care"] }),
    onError: () => setFeedback("We couldn't update that step. Nothing was changed. Please try again."),
  });

  const checkIn = useMutation({
    mutationFn: async () => {
      if (!view) return;
      if (guest) guest.onChange({ ...guest.patient, checkins: [{ status: checkStatus, message: checkText.trim(), date: formatIso("2026-09-25") }, ...(guest.patient.checkins ?? [])] });
      else await submitCheckIn(view.patientId, checkStatus, checkText.trim());
    },
    onSuccess: () => { setFeedback("Thank you. Your doctor will see this before your next visit."); setCheckStatus(""); setCheckText(""); queryClient.invalidateQueries({ queryKey: ["my-care"] }); },
    onError: () => setFeedback("We couldn't send your update. It was not saved. Please try again."),
  });

  const tasks = view?.tasks ?? [];
  const progress = progressOf(tasks);
  const open = tasks.filter((t) => t.status !== "Completed");
  const needsText = checkStatus !== "" && checkStatus !== "On track";

  const TaskRow = ({ task }: { task: CareTask }) => {
    const st = taskState(task);
    const Icon = stateIcon[st.tone];
    const done = st.tone === "done";
    return (
      <li className="flex items-start gap-3 py-3">
        <button type="button" aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`} onClick={() => toggleTask.mutate(task)} className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border", done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 hover:border-primary")}>{done && <Check className="size-3.5" />}</button>
        <div className="min-w-0 flex-1"><p className={cn("font-medium text-navy", done && "text-muted-foreground line-through")}>{task.title}</p><p className="text-xs text-muted-foreground">{task.detail}{task.dueIso && !done ? ` · Due ${formatIso(task.dueIso)}` : ""}</p></div>
        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium", st.tone === "overdue" ? "bg-critical-surface text-critical" : st.tone === "due" ? "bg-warning-surface text-warning" : "bg-muted text-muted-foreground")}><Icon className="size-3" />{st.label}</span>
      </li>
    );
  };

  const info = (icon: React.ReactNode, title: string, body: string) => (
    <div className="flex gap-3 py-3"><span className="mt-0.5 text-foreground">{icon}</span><div><h3 className="font-medium text-navy">{title}</h3><p className="mt-0.5 text-sm leading-6 text-muted-foreground">{body}</p></div></div>
  );

  const nextAppt = view?.followIso ? formatIso(view.followIso) : "Not scheduled";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-8">
        <span className="text-2xl font-bold text-navy">Avenn</span>
        {!guest && <Button variant="outline" size="sm" onClick={signOut}><LogOut />Sign out</Button>}
      </header>
      <nav aria-label="Patient sections" className="border-b border-border/60 bg-card px-4 sm:px-8"><div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto">{tabs.map((t) => <button key={t} type="button" aria-current={tab === t ? "page" : undefined} onClick={() => { setTab(t); setFeedback(""); }} className={cn("shrink-0 border-b-2 px-3 py-3 text-sm font-medium", tab === t ? "border-success text-foreground" : "border-transparent text-muted-foreground hover:text-navy")}>{t}</button>)}</div></nav>
      <main className="mx-auto max-w-3xl space-y-7 px-4 py-8 sm:px-8">
        {!view && !guest && (record.isLoading ? <div className="space-y-3" aria-busy="true"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="h-24 animate-pulse rounded bg-muted" /><div className="h-40 animate-pulse rounded bg-muted" /></div> : <p className="panel p-5 text-sm text-muted-foreground">We couldn't find your care record yet. Nothing has been changed. Please check again shortly.</p>)}
        {feedback && <p role="status" className="rounded-md border border-primary/20 bg-accent px-4 py-3 text-sm text-navy">{feedback}</p>}

        {view && tab === "Home" && <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h1 className="text-2xl font-bold text-navy">Hello, {view.name.split(" ")[0]}</h1><p className="mt-1 text-sm text-muted-foreground">Your care plan and next steps</p></div>
            <Button className="bg-critical text-destructive-foreground hover:bg-critical/90" onClick={() => { setEmergency(true); setSent(false); }}><PhoneCall />Emergency (off-hours)</Button>
          </div>
          <section className="panel flex flex-wrap items-center gap-4 p-5">
            <CalendarDays className="size-6 text-foreground" />
            <div className="flex-1"><p className="text-xs text-muted-foreground">Next appointment</p><strong className="text-lg text-navy">{nextAppt}</strong><p className="text-xs text-muted-foreground">{guest ? "Dr. Isha Mehta" : "Your care team"}</p></div>
            <StatusBadge status={view.followStatus} />
            <Button variant="outline" size="sm" onClick={() => setTab("Appointments")}>View appointment</Button>
          </section>
          <section>
            <div className="flex items-baseline justify-between"><h2 className="text-lg font-semibold text-navy">Your next steps</h2><span className="text-xs text-muted-foreground">{progress.done} of {progress.total} done</span></div>
            {open.length === 0 ? <div className="mt-3 rounded-md bg-accent p-5"><p className="font-medium text-navy">You're up to date</p><p className="text-sm text-muted-foreground">There are no outstanding care-plan actions right now.</p></div> : <ul className="mt-2 divide-y divide-border/60">{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</ul>}
            <Button variant="link" className="mt-1 h-auto p-0" onClick={() => setTab("My care")}>View my progress →</Button>
          </section>
          <section className="flat-section"><h2 className="text-lg font-semibold text-navy">Doctor's note</h2>{view.notes[0] ? <><p className="mt-2 text-xs font-semibold text-foreground">{view.notes[0].date} · {view.notes[0].author}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{view.notes[0].text}</p></> : <p className="mt-2 text-sm text-muted-foreground">No notes yet.</p>}<Button variant="link" className="mt-1 h-auto p-0" onClick={() => setTab("Notes")}>View all notes →</Button></section>
          <section className="rounded-md border border-critical/20 bg-critical-surface p-5">
            <h2 className="flex items-center gap-2 font-semibold text-critical"><AlertTriangle className="size-5" />Warning signs</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">{warningSigns.map((w) => <li key={w}>{w}</li>)}</ul>
            <p className="mt-3 text-sm font-semibold text-critical">Please consult your doctor immediately.</p>
          </section>
        </>}

        {view && tab === "My care" && <>
          <div><h1 className="text-2xl font-bold text-navy">My care plan</h1><p className="mt-1 text-sm text-muted-foreground">Progress: <strong className="text-navy">{progress.done} / {progress.total} actions completed</strong></p><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress.done} aria-valuemax={progress.total} aria-label="Care plan progress"><div className="h-full bg-success" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} /></div></div>
          <section><h2 className="text-lg font-semibold text-navy">Care actions</h2><ul className="mt-2 divide-y divide-border/60">{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</ul></section>
          <section className="flat-section"><h2 className="text-lg font-semibold text-navy">Care timeline</h2>
            <ol className="mt-3 space-y-4 border-l border-border pl-5">
              {[...tasks].sort((a, b) => (a.dueIso ?? "").localeCompare(b.dueIso ?? "")).filter((t) => t.dueIso).map((t) => <li key={t.id} className="relative"><span className="absolute -left-[1.6rem] top-1 size-2.5 rounded-full bg-success" /><p className="text-xs font-semibold text-foreground">{formatIso(t.dueIso)}</p><p className="text-sm font-medium text-navy">{t.title}</p><p className="text-xs text-muted-foreground">{taskState(t).label}</p></li>)}
              <li className="relative"><span className="absolute -left-[1.6rem] top-1 size-2.5 rounded-full border-2 border-primary bg-card" /><p className="text-xs font-semibold text-foreground">{nextAppt}</p><p className="text-sm font-medium text-navy">Next follow-up</p><p className="text-xs text-muted-foreground">{view.followStatus}</p></li>
            </ol>
          </section>
          <section className="flat-section">
            <h2 className="text-lg font-semibold text-navy">How are you doing with your plan?</h2>
            <div role="radiogroup" aria-label="Plan check-in" className="mt-3 grid gap-2">{CHECKIN_OPTIONS.map((o) => <button key={o} type="button" role="radio" aria-checked={checkStatus === o} onClick={() => setCheckStatus(o)} className={cn("flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm", checkStatus === o ? "border-success bg-accent text-navy" : "border-border bg-card hover:border-primary/50")}><span className={cn("grid size-4 place-items-center rounded-full border", checkStatus === o ? "border-primary" : "border-muted-foreground/50")}>{checkStatus === o && <span className="size-2 rounded-full bg-success" />}</span>{o}</button>)}</div>
            {needsText && <Textarea className="mt-3" aria-label="What is making it difficult?" placeholder="Tell your doctor what is making it difficult (optional)" value={checkText} onChange={(e) => setCheckText(e.target.value)} maxLength={400} />}
            <Button className="mt-3" disabled={!checkStatus || checkIn.isPending} onClick={() => checkIn.mutate()}>{checkIn.isPending ? "Sending…" : "Send to my doctor"}</Button>
            {view.checkins[0] && <p className="mt-3 text-xs text-muted-foreground">Last update {view.checkins[0].date}: {view.checkins[0].status}{view.checkins[0].message ? ` — "${view.checkins[0].message}"` : ""}</p>}
          </section>
          <section className="flat-section"><h2 className="text-lg font-semibold text-navy">Guidance</h2><div className="divide-y divide-border/60">
            {info(<Apple className="size-5" />, "Diet", "Fill half your plate with vegetables, choose whole grains, and keep sweet drinks and refined sugar for rare occasions.")}
            {info(<Footprints className="size-5" />, "Lifestyle", "Keep regular meal and sleep times, check your feet daily, and take your medicines exactly as prescribed.")}
            {info(<Dumbbell className="size-5" />, plan ? `Exercise · ${plan.title}` : "Exercise", plan ? `${plan.body} (BMI ${bmi?.toFixed(1)})` : "Add your height and weight to get an exercise plan.")}
            {info(<BookOpen className="size-5" />, "General awareness", "Diabetes is manageable. Regular checkups of blood sugar, kidneys, eyes and feet prevent most complications.")}
          </div></section>
        </>}

        {view && tab === "Appointments" && <>
          <h1 className="text-2xl font-bold text-navy">Appointments</h1>
          <section><h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming</h2>
            <div className="panel mt-2 flex flex-wrap items-center gap-4 p-5"><CalendarDays className="size-6 text-foreground" /><div className="flex-1"><strong className="text-lg text-navy">{nextAppt}</strong><p className="text-sm text-muted-foreground">{guest ? "Dr. Isha Mehta · " : ""}Follow-up</p><p className="mt-1 text-xs text-muted-foreground">Status: {view.apptStatus}</p></div><StatusBadge status={view.followStatus} /></div>
            <p className="mt-2 text-xs text-muted-foreground">To change this date, please contact the clinic. The clinic will confirm the new time.</p>
          </section>
          <section className="flat-section"><h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Previous</h2>
            <div className="mt-2 flex items-center gap-4 py-2"><Check className="size-5 text-foreground" /><div><strong className="text-navy">18 Sep 2026</strong><p className="text-sm text-muted-foreground">Consultation completed</p></div></div>
          </section>
        </>}

        {view && tab === "Notes" && <>
          <div><h1 className="text-2xl font-bold text-navy">Notes from your doctor</h1><p className="mt-1 text-sm text-muted-foreground">Only notes your doctor chose to share with you appear here.</p></div>
          <div className="divide-y divide-border/60">{view.notes.length === 0 && <p className="py-3 text-sm text-muted-foreground">No notes yet.</p>}{view.notes.map((n) => <article key={n.id} className="py-4"><p className="text-xs font-semibold text-foreground">{n.date} · {n.author}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{n.text}</p></article>)}</div>
        </>}
      </main>
      <Dialog open={emergency} onOpenChange={setEmergency}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Emergency (off-hours)</DialogTitle><DialogDescription>For urgent problems outside clinic hours. For life-threatening symptoms, call your local emergency number first.</DialogDescription></DialogHeader>
          {sent ? <p role="status" className="rounded-lg bg-accent p-3 text-sm text-navy">Request noted. In this prototype no real call is placed yet.</p> : <Button className="bg-critical text-destructive-foreground hover:bg-critical/90" onClick={() => setSent(true)}>Contact my doctor now</Button>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
