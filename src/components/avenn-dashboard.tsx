import { useMemo, useState, type ReactNode } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Bell, CalendarDays, Camera, Check, ChevronDown,
  ChevronRight, Circle, ClipboardCheck, Clock3, Copy, FileText, FlaskConical,
  HeartPulse, Home, Info, Menu, MessageSquare, MoreHorizontal, NotebookPen, Pill,
  Plus, Search, Settings, Stethoscope, UserRound, Users, Weight, X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ashaImage from "@/assets/asha-sharma.jpg";
import priyaImage from "@/assets/priya-sharma.jpg";

type Tab = "Overview" | "Recent Activity" | "Investigations" | "Care Plan" | "Previous Visits" | "Notes";
type Detail = { kind: "investigation" | "task" | "activity" | "visit"; title: string; subtitle?: string } | null;
type SimpleModal = "medication" | "investigation" | "task" | "note" | null;

const patients = [
  { name: "Asha Sharma", id: "SD-00421", phone: "+91 98765 40121", age: 52, gender: "Female", condition: "Type 2 Diabetes", image: ashaImage },
  { name: "Rohan Mehta", id: "SD-00387", phone: "+91 98100 93875", age: 46, gender: "Male", condition: "Type 2 Diabetes", image: undefined },
  { name: "Meera Kapoor", id: "SD-00435", phone: "+91 99887 20435", age: 61, gender: "Female", condition: "Type 1 Diabetes", image: undefined },
];

const metrics = [
  { label: "HbA1c", value: "7.4%", note: "Target: <7%", date: "11 Sep 2026", icon: FlaskConical, tone: "blue" },
  { label: "Fasting Glucose", value: "142 mg/dL", note: "", date: "11 Sep 2026", icon: Activity, tone: "amber" },
  { label: "Weight", value: "68 kg", note: "", date: "02 Sep 2026", icon: Weight, tone: "cyan" },
  { label: "Blood Pressure", value: "128/82", note: "", date: "02 Sep 2026", icon: HeartPulse, tone: "green" },
];
const trendAll = [
  { month: "Jan", value: 9.1 }, { month: "Feb", value: 8.2 }, { month: "Mar", value: 8.1 },
  { month: "Apr", value: 7.6 }, { month: "May", value: 7.2 }, { month: "Jun", value: 7.1 },
  { month: "Jul", value: 7.3 }, { month: "Aug", value: 7.0 }, { month: "Sep", value: 7.4 },
];
const investigations = [
  { name: "HbA1c", value: "7.4%", date: "11 Sep 2026", status: "Results received", icon: FlaskConical },
  { name: "Fasting Glucose", value: "142 mg/dL", date: "11 Sep 2026", status: "Results received", icon: Activity },
  { name: "Lipid Profile", value: "Available", date: "11 Sep 2026", status: "Results received", icon: Activity },
  { name: "Kidney Function", value: "Available", date: "11 Sep 2026", status: "Results received", icon: Activity },
  { name: "Retinal screening", value: "Due 30 Sep", date: "Assigned 02 Sep", status: "Pending", icon: Stethoscope },
];
const initialTasks = [
  { title: "Continue Metformin", note: "As prescribed", done: true },
  { title: "Record fasting glucose", note: "3 times per week", done: true },
  { title: "Lifestyle modifications", note: "30 minutes walking daily", done: false },
  { title: "Repeat HbA1c", note: "Before next visit", done: false },
];
const activities = [
  { date: "11 Sep 2026", title: "Lab result received", note: "HbA1c · 7.4%" },
  { date: "08 Sep 2026", title: "Task completed", note: "Recorded fasting glucose" },
  { date: "04 Sep 2026", title: "Care plan updated", note: "Plan confirmed" },
  { date: "02 Sep 2026", title: "Consultation", note: "Routine follow-up" },
  { date: "15 Jun 2026", title: "Investigation received", note: "HbA1c · 8.1%" },
];
const visits = [
  { date: "02 Sep 2026", title: "Routine follow-up", summary: "Patient reviewed after previous care plan.", actions: ["Care plan reviewed", "Glucose tracking discussed", "Investigation requested"] },
  { date: "15 Jun 2026", title: "Follow-up consultation", summary: "HbA1c recorded at 8.1%. Medication adherence reviewed.", actions: ["Metformin continued", "Lifestyle plan discussed"] },
  { date: "10 Mar 2026", title: "Diabetes review", summary: "Quarterly diabetes review and routine examination.", actions: ["Baseline investigations recorded"] },
];
const tabIcons = { Overview: Home, "Recent Activity": Activity, Investigations: FlaskConical, "Care Plan": ClipboardCheck, "Previous Visits": Clock3, Notes: MessageSquare };

export function AvennDashboard() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [detail, setDetail] = useState<Detail>(null);
  const [followOpen, setFollowOpen] = useState(false);
  const [followDate, setFollowDate] = useState("");
  const [savedFollowDate, setSavedFollowDate] = useState("");
  const [consultOpen, setConsultOpen] = useState(false);
  const [consultStep, setConsultStep] = useState(1);
  const [simpleModal, setSimpleModal] = useState<SimpleModal>(null);
  const [search, setSearch] = useState("");
  const [currentPatient, setCurrentPatient] = useState(patients[0]);
  const [mobileNav, setMobileNav] = useState(false);
  const [investigationFilter, setInvestigationFilter] = useState("All");
  const [notes, setNotes] = useState([
    { date: "02 Sep 2026", author: "Dr. Priya Sharma", text: "Patient discussed lifestyle modifications and agreed to continue daily walks." },
    { date: "10 Mar 2026", author: "Dr. Priya Sharma", text: "Initial consultation notes. Glucose monitoring routine established." },
  ]);
  const [tasks, setTasks] = useState(initialTasks);
  const [medications, setMedications] = useState([{ name: "Metformin", dosage: "500 mg", frequency: "BD", status: "Active" }]);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? patients.filter((p) => [p.name, p.id, p.phone].some((v) => v.toLowerCase().includes(term))) : [];
  }, [search]);

  const selectPatient = (patient: (typeof patients)[number]) => { setCurrentPatient(patient); setSearch(""); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={mobileNav} onClose={() => setMobileNav(false)} />
      <main className="min-h-screen lg:pl-48">
        <TopHeader search={search} setSearch={setSearch} matches={matches} onSelect={selectPatient} onMenu={() => setMobileNav(true)} />
        <div className="mx-auto max-w-[1500px] px-3 pb-24 sm:px-5 lg:px-7 lg:pb-8">
          <PatientHeader patient={currentPatient} followDate={savedFollowDate} onFollow={() => setFollowOpen(true)} onConsult={() => { setConsultStep(1); setConsultOpen(true); }} />
          <PatientTabs value={tab} onChange={setTab} />
          <div className="pt-4">
            {tab === "Overview" && <Overview onDetail={setDetail} tasks={tasks} setTasks={setTasks} onTab={setTab} />}
            {tab === "Recent Activity" && <ActivityPage onDetail={setDetail} />}
            {tab === "Investigations" && <InvestigationsPage filter={investigationFilter} setFilter={setInvestigationFilter} onDetail={setDetail} onAdd={() => setSimpleModal("investigation")} />}
            {tab === "Care Plan" && <CarePlan medications={medications} onAdd={setSimpleModal} onFollow={() => setFollowOpen(true)} />}
            {tab === "Previous Visits" && <VisitsPage onDetail={setDetail} />}
            {tab === "Notes" && <NotesPage notes={notes} onAdd={() => setSimpleModal("note")} />}
          </div>
        </div>
      </main>

      <FollowUpDialog open={followOpen} onOpenChange={setFollowOpen} date={followDate} setDate={setFollowDate} onSave={() => { setSavedFollowDate(followDate); setFollowOpen(false); }} />
      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
      <ConsultationDialog open={consultOpen} onOpenChange={setConsultOpen} step={consultStep} setStep={setConsultStep} onComplete={() => { setConsultOpen(false); setConsultStep(1); }} />
      <SimpleFormDialog type={simpleModal} onClose={() => setSimpleModal(null)} onSave={(value) => {
        if (simpleModal === "note") setNotes((n) => [{ date: "25 Sep 2026", author: "Dr. Priya Sharma", text: value || "New patient note" }, ...n]);
        if (simpleModal === "medication") setMedications((m) => [...m, { name: value || "New medication", dosage: "500 mg", frequency: "OD", status: "Active" }]);
        if (simpleModal === "task") setTasks((t) => [...t, { title: value || "New patient task", note: "Assigned today", done: false }]);
        setSimpleModal(null);
      }} />
      <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border border-border/70 bg-card/90 p-2 shadow-xl backdrop-blur-xl lg:hidden">
        <Button variant="outline" className="h-11 flex-1" onClick={() => setFollowOpen(true)}><CalendarDays /> Follow-up</Button>
        <Button className="h-11 flex-1 bg-navy hover:bg-navy/90" onClick={() => setConsultOpen(true)}>Start consultation <ArrowRight /></Button>
      </div>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = [
    ["Dashboard", Home], ["Patients", Users], ["Follow-ups", Clock3], ["Investigations", FlaskConical], ["Messages", MessageSquare],
  ] as const;
  return <>
    {open && <div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={onClose} aria-hidden />}
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-48 flex-col border-r border-border/50 bg-sidebar/95 px-4 py-6 backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="mb-8 flex items-center justify-between px-2"><span className="text-2xl font-bold tracking-normal text-navy">Avenn</span><Button size="icon" variant="ghost" className="lg:hidden" onClick={onClose} aria-label="Close navigation"><X /></Button></div>
      <nav className="space-y-2" aria-label="Main navigation">{nav.map(([label, Icon]) => <Button key={label} variant="ghost" className={cn("w-full justify-start gap-3 px-3 text-muted-foreground", label === "Patients" && "bg-accent text-primary shadow-sm hover:bg-accent")}><Icon />{label}</Button>)}</nav>
      <div className="mt-auto space-y-2 border-t border-border/60 pt-4"><Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground"><Settings />Settings</Button><Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground"><UserRound />Profile</Button><p className="px-3 pt-5 text-xs leading-relaxed text-muted-foreground">Keeping care connected between visits.</p></div>
    </aside>
  </>;
}

function TopHeader({ search, setSearch, matches, onSelect, onMenu }: { search: string; setSearch: (v: string) => void; matches: typeof patients; onSelect: (p: (typeof patients)[number]) => void; onMenu: () => void }) {
  return <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-7">
    <div className="mx-auto flex max-w-[1500px] items-center gap-3">
      <Button size="icon" variant="ghost" className="lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu /></Button>
      <div className="relative max-w-xl flex-1"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-full border-transparent bg-card pl-11 shadow-soft" placeholder="Search patients by name, phone or UHID..." aria-label="Search patients" />
        {matches.length > 0 && <div className="absolute top-12 z-50 w-full overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl">{matches.map((p) => <Button key={p.id} variant="ghost" className="h-auto w-full justify-start px-3 py-3" onClick={() => onSelect(p)}><span className="grid size-8 place-items-center rounded-full bg-accent text-primary"><UserRound className="size-4"/></span><span className="text-left"><span className="block font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.id} · {p.phone}</span></span></Button>)}</div>}
      </div>
      <Button variant="outline" className="hidden h-11 rounded-full bg-card md:flex"><CalendarDays/> Fri, 25 Sep 2026 <ChevronDown className="size-3"/></Button>
      <Button size="icon" variant="outline" className="relative h-11 w-11 rounded-full bg-card" aria-label="Notifications"><Bell/><span className="absolute right-2 top-2 size-2 rounded-full bg-destructive"/></Button>
      <div className="hidden items-center gap-2 sm:flex"><img src={priyaImage} alt="Dr. Priya Sharma" loading="lazy" width={816} height={816} className="size-10 rounded-full object-cover"/><div className="hidden xl:block"><p className="text-sm font-semibold">Dr. Priya Sharma</p><p className="text-xs text-muted-foreground">Endocrinologist</p></div><ChevronDown className="size-4 text-muted-foreground"/></div>
    </div>
  </header>;
}

function PatientHeader({ patient, followDate, onFollow, onConsult }: { patient: (typeof patients)[number]; followDate: string; onFollow: () => void; onConsult: () => void }) {
  return <section className="glass-panel mt-4 flex flex-col gap-5 overflow-hidden rounded-2xl p-5 sm:p-6 xl:flex-row xl:items-center">
    <div className="flex min-w-0 flex-1 items-center gap-4"><div className="relative shrink-0">{patient.image ? <img src={patient.image} alt={patient.name} width={816} height={816} className="size-20 rounded-full object-cover ring-4 ring-card sm:size-24"/> : <div className="grid size-20 place-items-center rounded-full bg-accent text-primary ring-4 ring-card sm:size-24"><UserRound className="size-9"/></div>}<span className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-card bg-card text-primary"><Camera className="size-3.5"/></span></div>
      <div className="min-w-0"><h1 className="truncate text-2xl font-bold text-navy sm:text-3xl">{patient.name}</h1><p className="mt-1 text-sm text-muted-foreground sm:text-base">{patient.age} yrs <span className="mx-2">·</span> {patient.gender} <span className="mx-2">·</span> {patient.condition}</p><div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><span>UHID: {patient.id}</span><Copy className="size-3.5"/></div><div className="mt-3 flex flex-wrap gap-2"><span className="tag">T2D</span><span className="tag">On Metformin</span><span className="tag">Since 2018</span></div></div>
    </div>
    <div className="hidden flex-wrap gap-3 lg:flex"><Button variant="outline" className="h-12 rounded-xl bg-card/70 px-5" onClick={onFollow}><CalendarDays className="text-primary"/>{followDate ? formatDate(followDate) : "Upcoming Follow-up"}</Button><Button className="h-12 rounded-xl bg-navy px-6 hover:bg-navy/90" onClick={onConsult}>Start Consultation <ArrowRight/></Button><Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl" aria-label="More patient actions"><MoreHorizontal/></Button></div>
  </section>;
}

function PatientTabs({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  return <div className="-mx-3 overflow-x-auto px-3 sm:-mx-5 sm:px-5 lg:-mx-0 lg:px-0"><nav className="flex min-w-max items-center justify-between border-b border-border/60" aria-label="Patient sections">{(Object.keys(tabIcons) as Tab[]).map((label) => { const Icon = tabIcons[label]; return <Button key={label} variant="ghost" onClick={() => onChange(label)} className={cn("relative h-14 rounded-none px-4 text-muted-foreground hover:bg-transparent", value === label && "text-navy after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary")}><Icon className="size-4"/>{label}</Button>; })}</nav></div>;
}

function Overview({ onDetail, tasks, setTasks, onTab }: { onDetail: (d: Detail) => void; tasks: typeof initialTasks; setTasks: React.Dispatch<React.SetStateAction<typeof initialTasks>>; onTab: (tab: Tab) => void }) {
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
    <div className="space-y-4">
      <section className="panel p-4"><div className="mb-3 flex items-center justify-between"><h2 className="section-title">Key Information <Info className="size-4 text-muted-foreground"/></h2><span className="text-xs text-muted-foreground">Last updated: 11 Sep 2026</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((m) => <MetricCard key={m.label} {...m} onClick={() => onDetail({ kind: "investigation", title: m.label, subtitle: m.value })}/>)}</div></section>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><TrendChart/><ListCard title="Latest Investigations" action={() => onTab("Investigations")}>{investigations.slice(0,4).map((item) => <InvestigationRow key={item.name} item={item} onClick={() => onDetail({ kind: "investigation", title: item.name, subtitle: item.value })}/>)}</ListCard></div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]"><ListCard title="Open Tasks" action={() => onTab("Care Plan")}>{tasks.map((task, i) => <Button key={task.title} variant="ghost" className="h-auto w-full justify-start rounded-lg px-1 py-2.5 text-left" onClick={() => { setTasks((current) => current.map((t, index) => index === i ? { ...t, done: !t.done } : t)); onDetail({ kind: "task", title: task.title, subtitle: task.note }); }}><span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", task.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60")} >{task.done && <Check className="size-3"/>}</span><span className="min-w-0 flex-1"><span className="block font-medium">{task.title}</span><span className="block text-xs font-normal text-muted-foreground">{task.note}</span></span><ChevronRight className="size-4 text-muted-foreground"/></Button>)}</ListCard><ListCard title="Recent Activity" action={() => onTab("Recent Activity")}><ActivityList items={activities.slice(0,4)} onDetail={onDetail}/></ListCard></div>
    </div>
    <aside className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft"><div className="summary-art relative flex min-h-72 items-end p-4"><div className="w-full rounded-xl border border-card/70 bg-card/55 p-4 backdrop-blur-xl"><p className="text-xl font-medium leading-tight text-navy">One patient.<br/>One shared<br/>care loop.</p></div></div><div className="p-5"><h3 className="flex items-center gap-2 font-semibold">Patient summary <Info className="size-4 text-muted-foreground"/></h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Asha has Type 2 Diabetes since 2018. Currently on Metformin. Recent HbA1c 7.4% (11 Sep 2026). Overall adherent to treatment and follow-up plan.</p></div></aside>
  </div>;
}

function MetricCard({ label, value, note, date, icon: Icon, tone, onClick }: typeof metrics[number] & { onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className={cn("metric-card h-auto min-h-28 w-full items-start justify-start whitespace-normal p-3 text-left", `metric-${tone}`)}><span className="metric-icon"><Icon/></span><span className="min-w-0"><span className="block text-xs font-medium text-muted-foreground">{label}</span><strong className="mt-1 block text-lg text-navy">{value}</strong>{note && <span className="block text-xs text-muted-foreground">{note}</span>}<span className="mt-1 block text-xs font-normal text-muted-foreground">{date}</span></span><span className="ml-auto self-end rounded-full bg-card p-1 text-primary"><ChevronRight className="size-4"/></span></Button>;
}

function TrendChart() {
  const [range, setRange] = useState("6");
  const data = range === "3" ? trendAll.slice(-3) : range === "6" ? trendAll.slice(-6) : trendAll;
  return <section className="panel min-h-72 p-4"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">HbA1c Trend</h2><Select value={range} onValueChange={setRange}><SelectTrigger className="w-36"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="3">Last 3 months</SelectItem><SelectItem value="6">Last 6 months</SelectItem><SelectItem value="12">Last 1 year</SelectItem><SelectItem value="all">All</SelectItem></SelectContent></Select></div><div className="h-52 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}/><YAxis domain={[5,10]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}/><Tooltip contentStyle={{ borderRadius: 10, borderColor: "var(--border)" }} formatter={(v) => [`${v}%`, "HbA1c"]}/><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#trendFill)" dot={{ fill: "var(--primary)", r: 3 }} activeDot={{ r: 5 }}/></AreaChart></ResponsiveContainer></div></section>;
}

function ListCard({ title, action, children }: { title: string; action: () => void; children: ReactNode }) { return <section className="panel p-4"><div className="mb-2 flex items-center justify-between"><h2 className="section-title">{title}</h2><Button variant="ghost" size="sm" onClick={action} className="text-muted-foreground">View all <ArrowRight className="size-3"/></Button></div><div>{children}</div></section>; }
function InvestigationRow({ item, onClick }: { item: typeof investigations[number]; onClick: () => void }) { const Icon = item.icon; return <Button variant="ghost" onClick={onClick} className="h-auto w-full justify-start gap-3 rounded-lg px-1 py-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><Icon className="size-4"/></span><span className="min-w-0 flex-1 truncate text-left text-sm font-medium">{item.name}</span><strong className="text-sm">{item.value}</strong><span className="hidden text-xs font-normal text-muted-foreground sm:block">{item.date}</span><ChevronRight className="size-4 text-muted-foreground"/></Button>; }
function ActivityList({ items, onDetail }: { items: typeof activities; onDetail: (d: Detail) => void }) { return <div className="relative pl-5 before:absolute before:bottom-5 before:left-[9px] before:top-5 before:w-px before:bg-primary/30">{items.map((item) => <Button key={`${item.date}-${item.title}`} variant="ghost" className="relative h-auto w-full justify-start rounded-lg px-2 py-2.5 text-left" onClick={() => onDetail({ kind: "activity", title: item.title, subtitle: item.note })}><span className="absolute -left-[17px] top-4 size-2.5 rounded-full border-2 border-primary bg-card"/><span className="w-24 shrink-0 text-xs font-normal text-muted-foreground">{item.date}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="block truncate text-xs font-normal text-muted-foreground">{item.note}</span></span><ChevronRight className="size-4 text-muted-foreground"/></Button>)}</div>; }

function PageIntro({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Patient workspace</p><h2 className="mt-1 text-2xl font-bold text-navy">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>; }
function ActivityPage({ onDetail }: { onDetail: (d: Detail) => void }) { return <><PageIntro title="Recent Activity" description="A shared record of events since Asha’s previous visit."/><section className="panel max-w-4xl p-5 sm:p-7"><ActivityList items={activities} onDetail={onDetail}/></section></>; }
function InvestigationsPage({ filter, setFilter, onDetail, onAdd }: { filter: string; setFilter: (v: string) => void; onDetail: (d: Detail) => void; onAdd: () => void }) { const shown = investigations.filter((i) => filter === "All" || i.status === filter); return <><PageIntro title="Investigations" description="Review current results and the patient’s investigation history." action={<Button onClick={onAdd}><Plus/>Assign investigation</Button>}/><div className="mb-4 flex gap-2">{["All","Pending","Results received"].map((x) => <Button key={x} size="sm" variant={filter === x ? "default" : "outline"} onClick={() => setFilter(x)}>{x}</Button>)}</div><section className="panel p-3 sm:p-5">{shown.map((item) => <InvestigationRow key={item.name} item={item} onClick={() => onDetail({ kind: "investigation", title: item.name, subtitle: item.value })}/>)}</section></>; }
function CarePlan({ medications, onAdd, onFollow }: { medications: { name:string;dosage:string;frequency:string;status:string }[]; onAdd: (m: SimpleModal) => void; onFollow: () => void }) { return <><PageIntro title="Care Plan" description="Manage the treatment plan agreed with Asha."/><div className="grid gap-4 lg:grid-cols-2"><CareSection icon={<Pill/>} title="Current Medications" action="Add medication" onAction={() => onAdd("medication")}>{medications.map((m) => <div key={m.name} className="data-row"><div><strong>{m.name}</strong><p>{m.dosage} · {m.frequency}</p></div><div className="flex items-center gap-2"><span className="status-dot"><Check/> {m.status}</span><Button size="sm" variant="outline">Edit</Button></div></div>)}</CareSection><CareSection icon={<ClipboardCheck/>} title="Patient Tasks" action="Add task" onAction={() => onAdd("task")}>{initialTasks.slice(1).map((t) => <div key={t.title} className="data-row"><div><strong>{t.title}</strong><p>{t.note} · Patient</p></div><ChevronRight/></div>)}</CareSection><CareSection icon={<FlaskConical/>} title="Investigations" action="Assign investigation" onAction={() => onAdd("investigation")}>{investigations.slice(0,2).map((i) => <div key={i.name} className="data-row"><div><strong>{i.name}</strong><p>{i.name === "HbA1c" ? "Due before next visit" : "Due weekly"}</p></div><span className="text-sm text-muted-foreground">Assigned</span></div>)}</CareSection><CareSection icon={<CalendarDays/>} title="Follow-up" action="Assign follow-up" onAction={onFollow}><div className="rounded-xl bg-muted/60 p-4"><p className="text-sm text-muted-foreground">The next visit is assigned by the doctor based on the agreed care plan.</p></div></CareSection></div></>; }
function CareSection({ icon, title, action, onAction, children }: { icon: ReactNode; title: string; action: string; onAction: () => void; children: ReactNode }) { return <section className="panel p-5"><div className="mb-4 flex items-center justify-between"><h3 className="section-title">{icon}{title}</h3><Button variant="outline" size="sm" onClick={onAction}><Plus/>{action}</Button></div><div className="space-y-2">{children}</div></section>; }
function VisitsPage({ onDetail }: { onDetail: (d: Detail) => void }) { return <><PageIntro title="Previous Visits" description="Consultation history, kept within the patient context."/><div className="space-y-4">{visits.map((v) => <article key={v.date} className="panel p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><time className="text-xs font-semibold text-primary">{v.date}</time><h3 className="mt-1 text-lg font-semibold text-navy">{v.title}</h3><p className="mt-3 text-sm text-muted-foreground">{v.summary}</p><ul className="mt-3 flex flex-wrap gap-2">{v.actions.map((a) => <li key={a} className="tag">{a}</li>)}</ul></div><Button variant="outline" onClick={() => onDetail({ kind: "visit", title: v.title, subtitle: v.date })}>View consultation <ArrowRight/></Button></div></article>)}</div></>; }
function NotesPage({ notes, onAdd }: { notes: {date:string;author:string;text:string}[]; onAdd: () => void }) { return <><PageIntro title="Notes" description="Clinical notes kept separate from measurements and reports." action={<Button onClick={onAdd}><Plus/>Add note</Button>}/><section className="panel divide-y divide-border/60">{notes.map((n) => <article key={`${n.date}-${n.text}`} className="p-5 sm:p-6"><div className="flex justify-between"><div><time className="text-xs font-semibold text-primary">{n.date}</time><p className="mt-1 text-sm font-medium">{n.author}</p></div><Button size="icon" variant="ghost" aria-label="Edit note"><MoreHorizontal/></Button></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{n.text}</p></article>)}</section></>; }

function FollowUpDialog({ open, onOpenChange, date, setDate, onSave }: { open:boolean;onOpenChange:(v:boolean)=>void;date:string;setDate:(v:string)=>void;onSave:()=>void }) { return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="rounded-2xl sm:max-w-md"><DialogHeader><DialogTitle>Assign Follow-up</DialogTitle><DialogDescription>Choose the next visit with Asha Sharma.</DialogDescription></DialogHeader><div className="space-y-4"><Field label="Patient"><Input value="Asha Sharma" readOnly/></Field><Field label="Next follow-up"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)}/></Field><Field label="Reason"><Input defaultValue="Routine diabetes follow-up"/></Field><Field label="Notes"><Textarea placeholder="Optional notes"/></Field><div className="rounded-lg bg-muted p-3 text-sm"><span className="text-muted-foreground">Assigned by</span><strong className="ml-2">Dr. Priya Sharma</strong></div></div><DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onSave} disabled={!date}>Save Follow-up</Button></DialogFooter></DialogContent></Dialog>; }
function ConsultationDialog({ open, onOpenChange, step, setStep, onComplete }: { open:boolean;onOpenChange:(v:boolean)=>void;step:number;setStep:(s:number)=>void;onComplete:()=>void }) { const labels=["Patient context","Consultation","Care plan","Review"]; return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-3xl"><DialogHeader><DialogTitle>Consultation · Asha Sharma</DialogTitle><DialogDescription>Record the visit and agree the next care plan.</DialogDescription></DialogHeader><div className="grid grid-cols-4 gap-2">{labels.map((l,i)=><div key={l} className={cn("rounded-lg border p-2 text-center text-xs", step===i+1?"border-primary bg-accent text-primary":"border-border text-muted-foreground")}><span className="font-semibold">{i+1}</span><span className="hidden sm:inline"> · {l}</span></div>)}</div><div className="min-h-72 py-2">{step===1&&<div className="grid gap-3 sm:grid-cols-2"><ContextTile label="Patient" value="Asha Sharma · 52 yrs · Female"/><ContextTile label="Condition" value="Type 2 Diabetes"/><ContextTile label="Latest HbA1c" value="7.4% · 11 Sep 2026"/><ContextTile label="Latest glucose" value="142 mg/dL · 11 Sep 2026"/><ContextTile label="Previous consultation" value="02 Sep 2026 · Routine follow-up"/></div>}{step===2&&<div className="space-y-4"><Field label="Reason for visit"><Input placeholder="Routine follow-up"/></Field><Field label="Clinical notes"><Textarea className="min-h-24" placeholder="Record observations from the consultation"/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Assessment"><Textarea placeholder="Clinical assessment"/></Field><Field label="Plan"><Textarea placeholder="Agreed plan"/></Field></div></div>}{step===3&&<div className="grid gap-3 sm:grid-cols-2">{[[Pill,"Medication"],[FlaskConical,"Investigation"],[ClipboardCheck,"Patient task"],[CalendarDays,"Follow-up"]].map(([Icon,label])=>{const I=Icon as typeof Pill;return <Button key={label as string} variant="outline" className="h-24 justify-start rounded-xl p-4"><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><I/></span><span className="text-base">Add {label as string}</span><Plus className="ml-auto"/></Button>})}</div>}{step===4&&<div className="space-y-3"><ContextTile label="Visit" value="Routine diabetes follow-up"/><ContextTile label="Recorded" value="Clinical notes, assessment and care plan"/><div className="rounded-xl border border-primary/20 bg-accent p-4"><p className="font-medium text-navy">Ready to complete</p><p className="mt-1 text-sm text-muted-foreground">This consultation will be added to Previous Visits and Recent Activity.</p></div></div>}</div><DialogFooter><Button variant="ghost" onClick={() => step>1?setStep(step-1):onOpenChange(false)}><ArrowLeft/>{step>1?"Back":"Cancel"}</Button>{step<4?<Button onClick={()=>setStep(step+1)}>Continue <ArrowRight/></Button>:<Button onClick={onComplete}><Check/>Complete Consultation</Button>}</DialogFooter></DialogContent></Dialog>; }
function SimpleFormDialog({ type, onClose, onSave }: { type: SimpleModal; onClose:()=>void; onSave:(value:string)=>void }) { const title = type === "medication" ? "Add medication" : type === "investigation" ? "Assign investigation" : type === "task" ? "Add patient task" : "Add note"; const [value,setValue]=useState(""); return <Dialog open={Boolean(type)} onOpenChange={(v)=>!v&&onClose()}><DialogContent className="rounded-2xl sm:max-w-md"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Add this item to Asha Sharma’s active record.</DialogDescription></DialogHeader><Field label={type === "note" ? "Note" : "Name"}>{type === "note" ? <Textarea value={value} onChange={(e)=>setValue(e.target.value)} className="min-h-28" placeholder="Write a clear clinical note"/> : <Input value={value} onChange={(e)=>setValue(e.target.value)} placeholder={type === "medication" ? "Medication name" : type === "task" ? "Task description" : "Investigation name"}/>}</Field>{type === "medication"&&<div className="grid grid-cols-2 gap-3"><Field label="Dosage"><Input placeholder="500 mg"/></Field><Field label="Frequency"><Input placeholder="OD"/></Field></div>}<DialogFooter><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={()=>onSave(value)}>Save</Button></DialogFooter></DialogContent></Dialog>; }
function DetailDrawer({ detail, onClose }: { detail: Detail; onClose:()=>void }) { return <Sheet open={Boolean(detail)} onOpenChange={(v)=>!v&&onClose()}><SheetContent className="w-full overflow-y-auto bg-card sm:max-w-md"><SheetHeader className="pt-6"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{detail?.kind}</p><SheetTitle className="text-2xl">{detail?.title}</SheetTitle><SheetDescription>{detail?.subtitle}</SheetDescription></SheetHeader>{detail?.kind === "investigation" ? <div className="mt-8 space-y-5"><ContextTile label="Current result" value={detail.subtitle || "Available"}/><ContextTile label="Date" value="11 Sep 2026"/><div><h4 className="font-semibold">Previous results</h4><div className="mt-3 h-40 rounded-xl bg-muted p-3"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendAll}><Area type="monotone" dataKey="value" stroke="var(--primary)" fill="var(--accent)"/><XAxis dataKey="month" hide/><YAxis hide/></AreaChart></ResponsiveContainer></div></div><div><h4 className="font-semibold">History</h4>{["11 Sep 2026 · 7.4%","15 Jun 2026 · 8.1%","10 Mar 2026 · 8.4%"].map(x=><div key={x} className="border-b border-border py-3 text-sm">{x}</div>)}</div></div> : <div className="mt-8 space-y-4"><ContextTile label="Details" value={detail?.subtitle || "Patient record"}/><ContextTile label="Recorded by" value="Dr. Priya Sharma"/><ContextTile label="Status" value={detail?.kind === "task" ? "Active" : "Recorded"}/></div>}</SheetContent></Sheet>; }
function Field({ label, children }: { label:string;children:ReactNode }) { return <label className="block space-y-2"><span className="text-sm font-medium">{label}</span>{children}</label>; }
function ContextTile({ label, value }: { label:string;value:string }) { return <div className="rounded-xl border border-border/70 bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-navy">{value}</p></div>; }
function formatDate(value: string) { if (!value) return ""; return new Intl.DateTimeFormat("en-GB", { day:"numeric", month:"short", year:"numeric", timeZone:"UTC" }).format(new Date(`${value}T00:00:00Z`)); }
