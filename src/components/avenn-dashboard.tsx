import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, ArrowLeft, ArrowRight, Bell, CalendarDays, Camera, Check, ChevronDown,
  ChevronRight, ClipboardCheck, Clock3, Droplet, FileText, FlaskConical,
  HeartPulse, Home, Info, Menu, MessageSquare, MoreHorizontal, Pill,
  Plus, Search, Settings, Stethoscope, TrendingDown, TrendingUp, UserRound, Users, Weight, X, Filter,
  Send, Paperclip, Phone, Video, Mail, CalendarCheck, AlertCircle, CheckCheck, Minus,
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

type Tab = "Overview" | "Investigations" | "Care Plan" | "Previous Visits" | "Notes";
export type WorkspacePage = "dashboard" | "patients" | "follow-ups" | "investigations" | "messages";
type Detail = { kind: "investigation" | "task" | "activity" | "visit"; title: string; subtitle?: string } | null;
type SimpleModal = "medication" | "investigation" | "task" | "note" | null;
type Task = { title: string; note: string; done: boolean };
type Medication = { name: string; dosage: string; frequency: string; status: string };
type Note = { date: string; author: string; text: string };
type Metric = { label: string; value: string; note: string; date: string; icon: typeof FlaskConical; tone: string };
type Comparison = {
  name: string; unit: string; previous: number | null; latest: number | null; previousLabel?: string; latestLabel?: string;
  previousDate: string; latestDate: string; low: number; high: number; max: number; lowerIsBetter: boolean;
  status: string; note: string; icon: typeof FlaskConical;
};
type Patient = {
  name: string; id: string; phone: string; age: number; gender: string; condition: string; image?: string;
  tags: string[]; slot: string; followUp: string; followUpStatus: string; summary: string;
  metrics: Metric[]; trend: { month: string; value: number }[]; comparisons: Comparison[];
  tasks: Task[]; medications: Medication[]; activities: { date: string; title: string; note: string }[];
  visits: { date: string; title: string; summary: string; actions: string[] }[]; notes: Note[];
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const trend = (values: number[]) => values.map((value, index) => ({ month: months[index] ?? "", value }));

const patients: Patient[] = [
  {
    name: "Asha Sharma", id: "SD-00421", phone: "+91 98765 40121", age: 52, gender: "Female",
    condition: "Type 2 Diabetes", image: ashaImage, tags: ["T2D", "On Metformin", "Since 2018"],
    slot: "09:30", followUp: "15 Oct 2026", followUpStatus: "Due this week",
    summary: "Asha has Type 2 Diabetes since 2018. Currently on Metformin. Recent HbA1c 7.4% (11 Sep 2026). Overall adherent to treatment and follow-up plan.",
    metrics: [
      { label: "HbA1c", value: "7.4%", note: "Target: <7%", date: "11 Sep 2026", icon: FlaskConical, tone: "blue" },
      { label: "Fasting Glucose", value: "142 mg/dL", note: "Target: <110", date: "11 Sep 2026", icon: Activity, tone: "amber" },
      { label: "Weight", value: "68 kg", note: "BMI 26.1", date: "02 Sep 2026", icon: Weight, tone: "cyan" },
      { label: "Blood Pressure", value: "128/82", note: "Target: <130/80", date: "02 Sep 2026", icon: HeartPulse, tone: "green" },
    ],
    trend: trend([9.1, 8.2, 8.1, 7.6, 7.2, 7.1, 7.3, 7.0, 7.4]),
    comparisons: [
      { name: "HbA1c", unit: "%", previous: 7.0, latest: 7.4, previousDate: "15 Jun 2026", latestDate: "11 Sep 2026", low: 4, high: 7, max: 12, lowerIsBetter: true, status: "Results received", note: "Slight rise since the last consultation. Reinforce diet and activity before the next review.", icon: FlaskConical },
      { name: "Fasting Glucose", unit: "mg/dL", previous: 128, latest: 142, previousDate: "15 Jun 2026", latestDate: "11 Sep 2026", low: 70, high: 110, max: 250, lowerIsBetter: true, status: "Results received", note: "Morning readings higher than the agreed range on three days of the week.", icon: Activity },
      { name: "Total Cholesterol", unit: "mg/dL", previous: 212, latest: 194, previousDate: "15 Jun 2026", latestDate: "11 Sep 2026", low: 120, high: 200, max: 300, lowerIsBetter: true, status: "Results received", note: "Improved and now within range.", icon: Droplet },
      { name: "Serum Creatinine", unit: "mg/dL", previous: 0.9, latest: 0.9, previousDate: "15 Jun 2026", latestDate: "11 Sep 2026", low: 0.6, high: 1.1, max: 2, lowerIsBetter: true, status: "Results received", note: "Kidney function stable.", icon: FileText },
      { name: "Retinal screening", unit: "", previous: null, latest: null, previousLabel: "Done 2025", latestLabel: "Due 30 Sep", previousDate: "12 Nov 2025", latestDate: "Assigned 02 Sep 2026", low: 0, high: 0, max: 0, lowerIsBetter: true, status: "Pending", note: "Annual screening assigned, appointment awaited.", icon: Stethoscope },
    ],
    tasks: [
      { title: "Continue Metformin", note: "As prescribed", done: true },
      { title: "Record fasting glucose", note: "3 times per week", done: true },
      { title: "Lifestyle modifications", note: "30 minutes walking daily", done: false },
      { title: "Repeat HbA1c", note: "Before next visit", done: false },
    ],
    medications: [{ name: "Metformin", dosage: "500 mg", frequency: "BD", status: "Active" }],
    activities: [
      { date: "11 Sep 2026", title: "Lab result received", note: "HbA1c · 7.4%" },
      { date: "08 Sep 2026", title: "Task completed", note: "Recorded fasting glucose" },
      { date: "04 Sep 2026", title: "Care plan updated", note: "Plan confirmed" },
      { date: "02 Sep 2026", title: "Consultation", note: "Routine follow-up" },
    ],
    visits: [
      { date: "02 Sep 2026", title: "Routine follow-up", summary: "Patient reviewed after previous care plan.", actions: ["Care plan reviewed", "Glucose tracking discussed", "Investigation requested"] },
      { date: "15 Jun 2026", title: "Follow-up consultation", summary: "HbA1c recorded at 7.0%. Medication adherence reviewed.", actions: ["Metformin continued", "Lifestyle plan discussed"] },
      { date: "10 Mar 2026", title: "Diabetes review", summary: "Quarterly diabetes review and routine examination.", actions: ["Baseline investigations recorded"] },
    ],
    notes: [
      { date: "02 Sep 2026", author: "Dr. Priya Sharma", text: "Patient discussed lifestyle modifications and agreed to continue daily walks." },
      { date: "10 Mar 2026", author: "Dr. Priya Sharma", text: "Initial consultation notes. Glucose monitoring routine established." },
    ],
  },
  {
    name: "Raj Mehta", id: "SD-00876", phone: "+91 98100 93875", age: 46, gender: "Male",
    condition: "Type 2 Diabetes", tags: ["T2D", "On Metformin + Glimepiride", "Since 2021"],
    slot: "11:00", followUp: "14 Oct 2026", followUpStatus: "Due this week",
    summary: "Raj has Type 2 Diabetes since 2021 with recent weight gain. HbA1c improving at 8.0% (20 Sep 2026). Lipid profile awaited.",
    metrics: [
      { label: "HbA1c", value: "8.0%", note: "Target: <7%", date: "20 Sep 2026", icon: FlaskConical, tone: "blue" },
      { label: "Fasting Glucose", value: "168 mg/dL", note: "Target: <110", date: "20 Sep 2026", icon: Activity, tone: "amber" },
      { label: "Weight", value: "84 kg", note: "BMI 29.4", date: "20 Sep 2026", icon: Weight, tone: "cyan" },
      { label: "Blood Pressure", value: "136/88", note: "Target: <130/80", date: "20 Sep 2026", icon: HeartPulse, tone: "green" },
    ],
    trend: trend([10.2, 9.8, 9.4, 9.1, 8.9, 8.6, 8.4, 8.2, 8.0]),
    comparisons: [
      { name: "HbA1c", unit: "%", previous: 8.4, latest: 8.0, previousDate: "18 Jun 2026", latestDate: "20 Sep 2026", low: 4, high: 7, max: 12, lowerIsBetter: true, status: "Results received", note: "Steady improvement since dose adjustment, still above target.", icon: FlaskConical },
      { name: "Fasting Glucose", unit: "mg/dL", previous: 186, latest: 168, previousDate: "18 Jun 2026", latestDate: "20 Sep 2026", low: 70, high: 110, max: 250, lowerIsBetter: true, status: "Results received", note: "Improving but consistently high. Review evening meals.", icon: Activity },
      { name: "Weight", unit: "kg", previous: 81, latest: 84, previousDate: "18 Jun 2026", latestDate: "20 Sep 2026", low: 60, high: 78, max: 110, lowerIsBetter: true, status: "Results received", note: "Weight gain of 3 kg. Discuss structured activity plan.", icon: Weight },
      { name: "Lipid Profile", unit: "", previous: null, latest: null, previousLabel: "228 mg/dL", latestLabel: "Sample awaited", previousDate: "18 Jun 2026", latestDate: "Ordered 20 Sep 2026", low: 0, high: 0, max: 0, lowerIsBetter: true, status: "Pending", note: "Sample not yet collected at the lab.", icon: Droplet },
    ],
    tasks: [
      { title: "Continue Metformin 1000 mg", note: "Twice daily with meals", done: true },
      { title: "Record fasting glucose", note: "Daily for two weeks", done: false },
      { title: "Reduce evening carbohydrates", note: "Dietitian plan shared", done: false },
      { title: "Give lipid profile sample", note: "At the lab this week", done: false },
    ],
    medications: [
      { name: "Metformin", dosage: "1000 mg", frequency: "BD", status: "Active" },
      { name: "Glimepiride", dosage: "1 mg", frequency: "OD", status: "Active" },
    ],
    activities: [
      { date: "20 Sep 2026", title: "Lab result received", note: "HbA1c · 8.0%" },
      { date: "20 Sep 2026", title: "Investigation assigned", note: "Lipid profile" },
      { date: "14 Sep 2026", title: "Patient message", note: "Asked about dosage timing" },
      { date: "18 Jun 2026", title: "Consultation", note: "Medication adjusted" },
    ],
    visits: [
      { date: "18 Jun 2026", title: "Medication review", summary: "Glimepiride added after persistently high fasting readings.", actions: ["Glimepiride started", "Glucose diary explained"] },
      { date: "12 Feb 2026", title: "Follow-up consultation", summary: "Weight gain discussed alongside a structured walking plan.", actions: ["Diet referral", "Activity plan agreed"] },
    ],
    notes: [
      { date: "20 Sep 2026", author: "Dr. Priya Sharma", text: "Tolerating Glimepiride well. No hypoglycaemic episodes reported." },
      { date: "18 Jun 2026", author: "Dr. Priya Sharma", text: "Shift work affecting meal timing. Agreed simplified evening routine." },
    ],
  },
  {
    name: "Neha Gupta", id: "SD-00312", phone: "+91 99870 31245", age: 58, gender: "Female",
    condition: "Type 2 Diabetes", tags: ["T2D", "On Insulin", "Since 2015"],
    slot: "14:15", followUp: "12 Sep 2026", followUpStatus: "Overdue",
    summary: "Neha has long-standing Type 2 Diabetes on basal insulin. Follow-up overdue by 13 days. Kidney function needs review.",
    metrics: [
      { label: "HbA1c", value: "9.2%", note: "Target: <7.5%", date: "18 Sep 2026", icon: FlaskConical, tone: "blue" },
      { label: "Fasting Glucose", value: "196 mg/dL", note: "Target: <130", date: "18 Sep 2026", icon: Activity, tone: "amber" },
      { label: "Weight", value: "74 kg", note: "BMI 28.0", date: "18 Sep 2026", icon: Weight, tone: "cyan" },
      { label: "Blood Pressure", value: "144/90", note: "Target: <130/80", date: "18 Sep 2026", icon: HeartPulse, tone: "green" },
    ],
    trend: trend([8.4, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1, 9.0, 9.2]),
    comparisons: [
      { name: "HbA1c", unit: "%", previous: 9.0, latest: 9.2, previousDate: "10 Jun 2026", latestDate: "18 Sep 2026", low: 4, high: 7.5, max: 12, lowerIsBetter: true, status: "Results received", note: "Rising trend. Insulin titration to be reviewed at this visit.", icon: FlaskConical },
      { name: "Fasting Glucose", unit: "mg/dL", previous: 178, latest: 196, previousDate: "10 Jun 2026", latestDate: "18 Sep 2026", low: 70, high: 130, max: 300, lowerIsBetter: true, status: "Results received", note: "Consistently high morning readings over the last month.", icon: Activity },
      { name: "Serum Creatinine", unit: "mg/dL", previous: 1.1, latest: 1.3, previousDate: "10 Jun 2026", latestDate: "18 Sep 2026", low: 0.6, high: 1.1, max: 2.5, lowerIsBetter: true, status: "Results received", note: "Above range. Repeat with urine albumin before medication changes.", icon: FileText },
      { name: "Systolic BP", unit: "mmHg", previous: 138, latest: 144, previousDate: "10 Jun 2026", latestDate: "18 Sep 2026", low: 100, high: 130, max: 200, lowerIsBetter: true, status: "Results received", note: "Blood pressure also rising. Review antihypertensive dose.", icon: HeartPulse },
    ],
    tasks: [
      { title: "Continue basal insulin", note: "18 units at bedtime", done: true },
      { title: "Record morning glucose", note: "Every day", done: false },
      { title: "Book overdue follow-up", note: "Overdue by 13 days", done: false },
      { title: "Repeat kidney function", note: "With urine albumin", done: false },
    ],
    medications: [
      { name: "Insulin Glargine", dosage: "18 units", frequency: "Nightly", status: "Active" },
      { name: "Metformin", dosage: "500 mg", frequency: "BD", status: "Active" },
      { name: "Telmisartan", dosage: "40 mg", frequency: "OD", status: "Active" },
    ],
    activities: [
      { date: "18 Sep 2026", title: "Lab result received", note: "Kidney function · Creatinine 1.3" },
      { date: "16 Sep 2026", title: "Follow-up missed", note: "Appointment not attended" },
      { date: "12 Sep 2026", title: "Reminder sent", note: "Follow-up reminder" },
      { date: "10 Jun 2026", title: "Consultation", note: "Insulin dose increased" },
    ],
    visits: [
      { date: "10 Jun 2026", title: "Insulin review", summary: "Basal insulin increased to 18 units after high morning readings.", actions: ["Insulin titrated", "Hypoglycaemia advice given"] },
      { date: "04 Jan 2026", title: "Annual diabetes review", summary: "Full annual review including foot and eye examination.", actions: ["Eye screening booked", "Foot check normal"] },
    ],
    notes: [
      { date: "18 Sep 2026", author: "Dr. Priya Sharma", text: "Patient reports difficulty attending weekday appointments. Offer weekend slot." },
      { date: "10 Jun 2026", author: "Dr. Priya Sharma", text: "Insulin technique reviewed with the nurse. Rotation of sites explained." },
    ],
  },
  {
    name: "Vikram Singh", id: "SD-00990", phone: "+91 98220 90901", age: 60, gender: "Male",
    condition: "Type 2 Diabetes", tags: ["T2D", "On Sitagliptin", "Since 2019"],
    slot: "16:00", followUp: "18 Oct 2026", followUpStatus: "Upcoming",
    summary: "Vikram is well controlled on Sitagliptin with HbA1c 6.8%. Retinal screening scheduled for 30 September.",
    metrics: [
      { label: "HbA1c", value: "6.8%", note: "Target: <7%", date: "12 Sep 2026", icon: FlaskConical, tone: "blue" },
      { label: "Fasting Glucose", value: "112 mg/dL", note: "Target: <110", date: "12 Sep 2026", icon: Activity, tone: "amber" },
      { label: "Weight", value: "71 kg", note: "BMI 24.6", date: "12 Sep 2026", icon: Weight, tone: "cyan" },
      { label: "Blood Pressure", value: "124/78", note: "Within target", date: "12 Sep 2026", icon: HeartPulse, tone: "green" },
    ],
    trend: trend([7.8, 7.6, 7.5, 7.3, 7.1, 7.0, 6.9, 6.9, 6.8]),
    comparisons: [
      { name: "HbA1c", unit: "%", previous: 7.1, latest: 6.8, previousDate: "14 Jun 2026", latestDate: "12 Sep 2026", low: 4, high: 7, max: 12, lowerIsBetter: true, status: "Results received", note: "Now within target. Continue the current plan.", icon: FlaskConical },
      { name: "Fasting Glucose", unit: "mg/dL", previous: 124, latest: 112, previousDate: "14 Jun 2026", latestDate: "12 Sep 2026", low: 70, high: 110, max: 250, lowerIsBetter: true, status: "Results received", note: "Close to target range.", icon: Activity },
      { name: "LDL Cholesterol", unit: "mg/dL", previous: 118, latest: 96, previousDate: "14 Jun 2026", latestDate: "12 Sep 2026", low: 50, high: 100, max: 200, lowerIsBetter: true, status: "Results received", note: "Improved after statin adherence discussion.", icon: Droplet },
      { name: "Retinal screening", unit: "", previous: null, latest: null, previousLabel: "Normal 2025", latestLabel: "Due 30 Sep", previousDate: "22 Sep 2025", latestDate: "Scheduled 30 Sep 2026", low: 0, high: 0, max: 0, lowerIsBetter: true, status: "Scheduled", note: "Annual screening appointment confirmed.", icon: Stethoscope },
    ],
    tasks: [
      { title: "Continue Sitagliptin", note: "100 mg once daily", done: true },
      { title: "Weekly glucose check", note: "Once a week is sufficient", done: true },
      { title: "Attend retinal screening", note: "30 Sep 2026", done: false },
    ],
    medications: [
      { name: "Sitagliptin", dosage: "100 mg", frequency: "OD", status: "Active" },
      { name: "Atorvastatin", dosage: "10 mg", frequency: "Nightly", status: "Active" },
    ],
    activities: [
      { date: "12 Sep 2026", title: "Lab result received", note: "HbA1c · 6.8%" },
      { date: "12 Sep 2026", title: "Investigation scheduled", note: "Retinal screening · 30 Sep" },
      { date: "14 Jun 2026", title: "Consultation", note: "Routine review" },
    ],
    visits: [
      { date: "14 Jun 2026", title: "Routine review", summary: "Good control maintained. Statin adherence discussed.", actions: ["Plan continued", "Screening reminder set"] },
      { date: "20 Dec 2025", title: "Follow-up consultation", summary: "Sitagliptin continued after stable readings.", actions: ["Medication continued"] },
    ],
    notes: [
      { date: "12 Sep 2026", author: "Dr. Priya Sharma", text: "Patient motivated and self-monitoring reliably. Reduce visit frequency if stable." },
      { date: "14 Jun 2026", author: "Dr. Priya Sharma", text: "Walking 45 minutes daily. Encouraged to continue." },
    ],
  },
];

const primaryPatient = patients[0] as Patient;
let lastSelectedPatientId = primaryPatient.id;

const inbox = [
  { name: "Asha Sharma", preview: "I have uploaded this week’s glucose readings.", time: "10:42", unread: 2 },
  { name: "Raj Mehta", preview: "Should I continue the same dose?", time: "09:18", unread: 1 },
  { name: "Neha Gupta", preview: "My lab appointment is confirmed for Monday.", time: "Yesterday", unread: 0 },
  { name: "Vikram Singh", preview: "Thank you, doctor.", time: "Yesterday", unread: 0 },
];
const tabIcons = { Overview: Home, Investigations: FlaskConical, "Care Plan": ClipboardCheck, "Previous Visits": Clock3, Notes: MessageSquare };
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("");

export function AvennDashboard({ initialPage = "patients" }: { initialPage?: WorkspacePage }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Overview");
  const [detail, setDetail] = useState<Detail>(null);
  const [followOpen, setFollowOpen] = useState(false);
  const [followDate, setFollowDate] = useState("");
  const [savedFollowDate, setSavedFollowDate] = useState("");
  const [consultOpen, setConsultOpen] = useState(false);
  const [consultStep, setConsultStep] = useState(1);
  const [simpleModal, setSimpleModal] = useState<SimpleModal>(null);
  const [search, setSearch] = useState("");
  const [currentPatient, setCurrentPatient] = useState<Patient>(
    patients.find((p) => p.id === lastSelectedPatientId) ?? primaryPatient,
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [investigationFilter, setInvestigationFilter] = useState("All");
  const [notes, setNotes] = useState<Note[]>(currentPatient.notes);
  const [tasks, setTasks] = useState<Task[]>(currentPatient.tasks);
  const [medications, setMedications] = useState<Medication[]>(currentPatient.medications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? patients.filter((p) => [p.name, p.id, p.phone].some((v) => v.toLowerCase().includes(term))) : [];
  }, [search]);

  const selectPatient = (patient: Patient, navigateToPatients = true) => {
    lastSelectedPatientId = patient.id;
    setCurrentPatient(patient);
    setNotes(patient.notes);
    setTasks(patient.tasks);
    setMedications(patient.medications);
    setSavedFollowDate("");
    setTab("Overview");
    setSearch("");
    if (navigateToPatients && initialPage !== "patients") navigate({ to: "/patients" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={mobileNav} onClose={() => setMobileNav(false)} active={initialPage} />
      <main className="min-h-screen lg:pl-48">
        <TopHeader search={search} setSearch={setSearch} matches={matches} onSelect={selectPatient} onMenu={() => setMobileNav(true)} onNotifications={() => setNotificationsOpen(true)} onProfile={() => setProfileOpen(true)} />
        <div className="mx-auto w-full max-w-[1600px] px-3 pb-24 sm:px-5 lg:px-7 lg:pb-8">
          {initialPage === "patients" ? <>
            <PatientHeader patient={currentPatient} followDate={savedFollowDate} onFollow={() => setFollowOpen(true)} onConsult={() => { setConsultStep(1); setConsultOpen(true); }} />
            <PatientTabs value={tab} onChange={setTab} />
            <div className="pt-4">
              {tab === "Overview" && <Overview patient={currentPatient} onDetail={setDetail} tasks={tasks} setTasks={setTasks} onTab={setTab} onSelectPatient={selectPatient} />}
              {tab === "Investigations" && <InvestigationsPage patient={currentPatient} filter={investigationFilter} setFilter={setInvestigationFilter} onAdd={() => setSimpleModal("investigation")} />}
              {tab === "Care Plan" && <CarePlan patient={currentPatient} medications={medications} tasks={tasks} setTasks={setTasks} onAdd={setSimpleModal} onFollow={() => setFollowOpen(true)} />}
              {tab === "Previous Visits" && <VisitsPage patient={currentPatient} onDetail={setDetail} />}
              {tab === "Notes" && <NotesPage patient={currentPatient} notes={notes} onAdd={() => setSimpleModal("note")} />}
            </div>
          </> : null}
          {initialPage === "dashboard" && <PracticeDashboard onNavigate={(to) => navigate({ to })} onSelectPatient={selectPatient} />}
          {initialPage === "follow-ups" && <FollowUpsPage onAssign={() => setFollowOpen(true)} onOpenPatient={selectPatient} />}
          {initialPage === "investigations" && <PracticeInvestigations onAssign={() => setSimpleModal("investigation")} onOpenPatient={selectPatient} />}
          {initialPage === "messages" && <MessagesPage />}
        </div>
      </main>

      <FollowUpDialog open={followOpen} onOpenChange={setFollowOpen} patient={currentPatient} date={followDate} setDate={setFollowDate} onSave={() => { setSavedFollowDate(followDate); setFollowOpen(false); setFeedback("Follow-up saved"); }} />
      <DetailDrawer detail={detail} onClose={() => setDetail(null)} />
      <ConsultationDialog open={consultOpen} onOpenChange={setConsultOpen} patient={currentPatient} step={consultStep} setStep={setConsultStep} onComplete={() => { setConsultOpen(false); setConsultStep(1); setFeedback("Consultation completed"); }} />
      <SimpleFormDialog type={simpleModal} onClose={() => setSimpleModal(null)} onSave={(value) => {
        if (simpleModal === "note") setNotes((n) => [{ date: "25 Sep 2026", author: "Dr. Priya Sharma", text: value || "New patient note" }, ...n]);
        if (simpleModal === "medication") setMedications((m) => [...m, { name: value || "New medication", dosage: "500 mg", frequency: "OD", status: "Active" }]);
        if (simpleModal === "task") setTasks((t) => [...t, { title: value || "New patient task", note: "Assigned today", done: false }]);
        if (simpleModal === "investigation") setFeedback(`${value || "Investigation"} assigned successfully`);
        setSimpleModal(null);
      }} />
      <NotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      {feedback && <div role="status" className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-soft"><Check className="size-4 text-primary"/>{feedback}<Button size="icon" variant="ghost" className="size-7" onClick={() => setFeedback("")} aria-label="Dismiss message"><X/></Button></div>}
      {initialPage === "patients" && <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-2xl border border-border/70 bg-card/90 p-2 shadow-xl backdrop-blur-xl lg:hidden">
        <Button variant="outline" className="h-11 flex-1" onClick={() => setFollowOpen(true)}><CalendarDays /> Follow-up</Button>
        <Button className="h-11 flex-1 bg-navy hover:bg-navy/90" onClick={() => setConsultOpen(true)}>Start consultation <ArrowRight /></Button>
      </div>}
    </div>
  );
}

function Sidebar({ open, onClose, active }: { open: boolean; onClose: () => void; active: WorkspacePage }) {
  const nav = [
    ["Dashboard", Home, "/"], ["Patients", Users, "/patients"], ["Follow-ups", Clock3, "/follow-ups"], ["Messages", MessageSquare, "/messages"],
  ] as const;
  return <>
    {open && <div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={onClose} aria-hidden />}
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-48 flex-col border-r border-border/50 bg-sidebar/95 px-4 py-6 backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="mb-8 flex items-center justify-between px-2"><span className="text-2xl font-bold tracking-normal text-navy">Avenn</span><Button size="icon" variant="ghost" className="lg:hidden" onClick={onClose} aria-label="Close navigation"><X /></Button></div>
      <nav className="space-y-2" aria-label="Main navigation">{nav.map(([label, Icon, to]) => <Button key={label} asChild variant="ghost" className={cn("w-full justify-start gap-3 px-3 text-muted-foreground", active === label.toLowerCase() && "bg-accent text-primary shadow-sm hover:bg-accent")}><Link to={to} onClick={onClose}><Icon />{label}</Link></Button>)}</nav>
      <div className="mt-auto border-t border-border/60 pt-5"><div className="flex items-center gap-3 px-2"><img src={priyaImage} alt="Dr. Priya Sharma" className="size-9 rounded-full object-cover"/><div><p className="text-xs font-semibold">Dr. Priya Sharma</p><p className="text-xs text-muted-foreground">Endocrinologist</p></div></div><p className="px-2 pt-5 text-xs leading-relaxed text-muted-foreground">Keeping care connected between visits.</p></div>
    </aside>
  </>;
}

function TopHeader({ search, setSearch, matches, onSelect, onMenu, onNotifications, onProfile }: { search: string; setSearch: (v: string) => void; matches: Patient[]; onSelect: (p: Patient) => void; onMenu: () => void; onNotifications: () => void; onProfile: () => void }) {
  return <header className="sticky top-0 z-30 border-b border-border/40 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-7">
    <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button size="icon" variant="ghost" className="lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu /></Button>
        <div className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-full border-transparent bg-card pl-11 shadow-soft" placeholder="Search patients by name, phone or UHID..." aria-label="Search patients" />
          {matches.length > 0 && <div className="absolute top-12 z-50 w-full overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl">{matches.map((p) => <Button key={p.id} variant="ghost" className="h-auto w-full justify-start px-3 py-3" onClick={() => onSelect(p)}><span className="grid size-8 place-items-center rounded-full bg-accent text-primary"><UserRound className="size-4"/></span><span className="text-left"><span className="block font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.id} · {p.phone}</span></span></Button>)}</div>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm md:flex"><CalendarDays className="size-4"/> Fri, 25 Sep 2026</div>
        <Button size="icon" variant="outline" onClick={onNotifications} className="relative h-11 w-11 rounded-full bg-card" aria-label="Notifications"><Bell/><span className="absolute right-2 top-2 size-2 rounded-full bg-destructive"/></Button>
        <Button size="icon" variant="ghost" onClick={onProfile} className="size-11 shrink-0 rounded-full p-0" aria-label="Open profile"><img src={priyaImage} alt="Dr. Priya Sharma" loading="lazy" width={816} height={816} className="size-11 rounded-full object-cover"/></Button>
      </div>
    </div>
  </header>;
}

function PatientHeader({ patient, followDate, onFollow, onConsult }: { patient: Patient; followDate: string; onFollow: () => void; onConsult: () => void }) {
  return <section className="glass-panel mt-4 flex flex-col gap-5 overflow-hidden rounded-2xl p-5 sm:p-6 xl:flex-row xl:items-center">
    <div className="flex min-w-0 flex-1 items-center gap-4"><div className="relative shrink-0">{patient.image ? <img src={patient.image} alt={patient.name} width={816} height={816} className="size-20 rounded-full object-cover ring-4 ring-card sm:size-24"/> : <div className="grid size-20 place-items-center rounded-full bg-accent text-2xl font-semibold text-primary ring-4 ring-card sm:size-24">{initials(patient.name)}</div>}<span className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-card bg-card text-primary"><Camera className="size-3.5"/></span></div>
      <div className="min-w-0"><h1 className="truncate text-2xl font-bold text-navy sm:text-3xl">{patient.name}</h1><p className="mt-1 text-sm text-muted-foreground sm:text-base">{patient.age} yrs <span className="mx-2">·</span> {patient.gender} <span className="mx-2">·</span> {patient.condition}</p><div className="mt-3 flex flex-wrap gap-2">{patient.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div></div>
    </div>
    <div className="hidden flex-wrap gap-3 lg:flex"><Button variant="outline" className="h-12 rounded-xl bg-card/70 px-5" onClick={onFollow}><CalendarDays className="text-primary"/>{followDate ? formatDate(followDate) : `Follow-up · ${patient.followUp}`}</Button><Button className="h-12 rounded-xl bg-navy px-6 hover:bg-navy/90" onClick={onConsult}>Start Consultation <ArrowRight/></Button></div>
  </section>;
}

function PatientTabs({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  return <div className="-mx-3 overflow-x-auto px-3 sm:-mx-5 sm:px-5 lg:-mx-0 lg:px-0"><nav className="flex min-w-max items-center gap-1 border-b border-border/60" aria-label="Patient sections">{(Object.keys(tabIcons) as Tab[]).map((label) => { const Icon = tabIcons[label]; return <Button key={label} variant="ghost" onClick={() => onChange(label)} className={cn("relative h-14 rounded-none px-4 text-muted-foreground hover:bg-transparent", value === label && "text-navy after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary")}><Icon className="size-4"/>{label}</Button>; })}</nav></div>;
}

function Overview({ patient, onDetail, tasks, setTasks, onTab, onSelectPatient }: { patient: Patient; onDetail: (d: Detail) => void; tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; onTab: (tab: Tab) => void; onSelectPatient: (p: Patient) => void }) {
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
    <div className="space-y-4">
      <section className="panel p-4"><div className="mb-3 flex items-center justify-between"><h2 className="section-title">Key Information <Info className="size-4 text-muted-foreground"/></h2><span className="text-xs text-muted-foreground">Last updated: {patient.metrics[0]?.date}</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{patient.metrics.map((m) => <MetricCard key={m.label} {...m} onClick={() => onDetail({ kind: "investigation", title: m.label, subtitle: m.value })}/>)}</div></section>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><TrendChart data={patient.trend}/><ListCard title="Latest Investigations" action={() => onTab("Investigations")}>{patient.comparisons.slice(0, 4).map((item) => <ComparisonRow key={item.name} item={item} onClick={() => onTab("Investigations")}/>)}</ListCard></div>
      <ListCard title="Open Tasks" action={() => onTab("Care Plan")}>{tasks.map((task, i) => <Button key={task.title} variant="ghost" className="h-auto w-full justify-start rounded-lg px-1 py-2.5 text-left" onClick={() => { setTasks((current) => current.map((t, index) => index === i ? { ...t, done: !t.done } : t)); }}><span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", task.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60")} >{task.done && <Check className="size-3"/>}</span><span className="min-w-0 flex-1"><span className={cn("block font-medium", task.done && "text-muted-foreground line-through")}>{task.title}</span><span className="block text-xs font-normal text-muted-foreground">{task.note}</span></span><ChevronRight className="size-4 text-muted-foreground"/></Button>)}</ListCard>
    </div>
    <aside className="space-y-4">
      <section className="panel p-4"><h3 className="section-title mb-1">Next patients</h3><p className="mb-3 text-xs text-muted-foreground">Today’s list · Friday, 25 September</p><div className="space-y-1">{patients.map((p) => <Button key={p.id} variant="ghost" onClick={() => onSelectPatient(p)} className={cn("h-auto w-full justify-start gap-3 rounded-xl p-2.5 text-left", p.id === patient.id && "bg-accent")}><span className="w-11 shrink-0 text-xs font-semibold text-primary">{p.slot}</span>{p.image ? <img src={p.image} alt={p.name} className="size-9 shrink-0 rounded-full object-cover"/> : <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-primary">{initials(p.name)}</span>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{p.name}</span><span className="block truncate text-xs font-normal text-muted-foreground">{p.age} yrs · {p.condition}</span></span><ChevronRight className="size-4 shrink-0 text-muted-foreground"/></Button>)}</div></section>
      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft"><div className="summary-art relative flex min-h-48 items-end p-4"><div className="w-full rounded-xl border border-card/70 bg-card/55 p-4 backdrop-blur-xl"><p className="text-xl font-medium leading-tight text-navy">One patient.<br/>One shared<br/>care loop.</p></div></div><div className="p-5"><h3 className="flex items-center gap-2 font-semibold">Patient summary <Info className="size-4 text-muted-foreground"/></h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{patient.summary}</p></div></section>
    </aside>
  </div>;
}

function MetricCard({ label, value, note, date, icon: Icon, tone, onClick }: Metric & { onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className={cn("metric-card h-auto min-h-28 w-full items-start justify-start whitespace-normal p-3 text-left", `metric-${tone}`)}><span className="metric-icon"><Icon/></span><span className="min-w-0"><span className="block text-xs font-medium text-muted-foreground">{label}</span><strong className="mt-1 block text-lg text-navy">{value}</strong>{note && <span className="block text-xs text-muted-foreground">{note}</span>}<span className="mt-1 block text-xs font-normal text-muted-foreground">{date}</span></span><span className="ml-auto self-end rounded-full bg-card p-1 text-primary"><ChevronRight className="size-4"/></span></Button>;
}

function TrendChart({ data }: { data: { month: string; value: number }[] }) {
  const [range, setRange] = useState("6");
  const shown = range === "3" ? data.slice(-3) : range === "6" ? data.slice(-6) : data;
  return <section className="panel min-h-72 p-4"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">HbA1c Trend</h2><Select value={range} onValueChange={setRange}><SelectTrigger className="w-36"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="3">Last 3 months</SelectItem><SelectItem value="6">Last 6 months</SelectItem><SelectItem value="12">Last 1 year</SelectItem><SelectItem value="all">All</SelectItem></SelectContent></Select></div><div className="h-52 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={shown} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}/><YAxis domain={[5,11]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}/><Tooltip contentStyle={{ borderRadius: 10, borderColor: "var(--border)" }} formatter={(v) => [`${v}%`, "HbA1c"]}/><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#trendFill)" dot={{ fill: "var(--primary)", r: 3 }} activeDot={{ r: 5 }}/></AreaChart></ResponsiveContainer></div></section>;
}

function ListCard({ title, action, children }: { title: string; action: () => void; children: ReactNode }) { return <section className="panel p-4"><div className="mb-2 flex items-center justify-between"><h2 className="section-title">{title}</h2><Button variant="ghost" size="sm" onClick={action} className="text-muted-foreground">View all <ArrowRight className="size-3"/></Button></div><div>{children}</div></section>; }

function ComparisonRow({ item, onClick }: { item: Comparison; onClick: () => void }) {
  const Icon = item.icon;
  return <Button variant="ghost" onClick={onClick} className="h-auto w-full justify-start gap-3 rounded-lg px-1 py-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><Icon className="size-4"/></span><span className="min-w-0 flex-1 truncate text-left text-sm font-medium">{item.name}</span><strong className="text-sm">{item.latest !== null ? `${item.latest}${item.unit}` : item.latestLabel}</strong><DeltaChip item={item}/><ChevronRight className="size-4 text-muted-foreground"/></Button>;
}

function changeOf(item: Comparison) {
  if (item.latest === null || item.previous === null) return null;
  const diff = Number((item.latest - item.previous).toFixed(2));
  const improved = item.lowerIsBetter ? diff < 0 : diff > 0;
  return { diff, improved, flat: diff === 0, percent: item.previous ? Math.round((diff / item.previous) * 100) : 0 };
}

function DeltaChip({ item }: { item: Comparison }) {
  const change = changeOf(item);
  if (!change) return <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.status}</span>;
  const Icon = change.flat ? Minus : change.diff > 0 ? TrendingUp : TrendingDown;
  return <span className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", change.flat ? "bg-muted text-muted-foreground" : change.improved ? "bg-accent text-primary" : "bg-destructive/10 text-destructive")}><Icon className="size-3"/>{change.flat ? "No change" : `${change.diff > 0 ? "+" : ""}${change.diff}${item.unit}`}</span>;
}

function ComparisonCard({ item, open, onToggle }: { item: Comparison; open: boolean; onToggle: () => void }) {
  const Icon = item.icon;
  const change = changeOf(item);
  const inRange = item.latest !== null && item.latest >= item.low && item.latest <= item.high;
  const scale = (value: number) => `${Math.min(100, Math.max(3, (value / (item.max || 1)) * 100))}%`;
  return <article className={cn("rounded-2xl border border-border/70 bg-card transition-shadow", open && "shadow-soft")}>
    <Button variant="ghost" onClick={onToggle} aria-expanded={open} className="h-auto w-full items-center justify-start gap-4 whitespace-normal rounded-2xl p-4 text-left sm:p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-5"/></span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-navy">{item.name}</span>
        <span className="block text-xs font-normal text-muted-foreground">{item.latest !== null ? `Latest ${item.latestDate}` : item.latestDate}</span>
      </span>
      <span className="hidden text-right sm:block"><span className="block text-xs text-muted-foreground">Previous</span><strong className="text-sm text-muted-foreground">{item.previous !== null ? `${item.previous}${item.unit}` : item.previousLabel}</strong></span>
      <span className="text-right"><span className="block text-xs text-muted-foreground">Latest</span><strong className="text-lg text-navy">{item.latest !== null ? `${item.latest}${item.unit}` : item.latestLabel}</strong></span>
      <DeltaChip item={item}/>
      <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}/>
    </Button>
    {open && <div className="space-y-5 border-t border-border/60 p-4 sm:p-5">
      {item.latest !== null && item.previous !== null ? <>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><span className="w-24 shrink-0 text-xs text-muted-foreground">Previous</span><span className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-navy/25" style={{ width: scale(item.previous) }}/></span><span className="w-24 shrink-0 text-right text-sm text-muted-foreground">{item.previous}{item.unit}</span></div>
          <div className="flex items-center gap-3"><span className="w-24 shrink-0 text-xs font-medium text-navy">Latest</span><span className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", inRange ? "bg-primary" : "bg-destructive/70")} style={{ width: scale(item.latest) }}/></span><span className="w-24 shrink-0 text-right text-sm font-semibold text-navy">{item.latest}{item.unit}</span></div>
          <div className="flex items-center gap-3"><span className="w-24 shrink-0 text-xs text-muted-foreground">Target range</span><span className="relative h-2 flex-1 rounded-full bg-muted"><span className="absolute inset-y-0 rounded-full bg-primary/25" style={{ left: scale(item.low), width: `${Math.max(4, ((item.high - item.low) / (item.max || 1)) * 100)}%` }}/></span><span className="w-24 shrink-0 text-right text-xs text-muted-foreground">{item.low}–{item.high}{item.unit}</span></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ContextTile label={`Previous · ${item.previousDate}`} value={`${item.previous}${item.unit}`}/>
          <ContextTile label={`Latest · ${item.latestDate}`} value={`${item.latest}${item.unit}`}/>
          <ContextTile label="Change since last visit" value={change ? (change.flat ? "No change" : `${change.diff > 0 ? "+" : ""}${change.diff}${item.unit} (${change.percent > 0 ? "+" : ""}${change.percent}%)`) : item.status}/>
        </div>
        <p className={cn("rounded-xl p-4 text-sm", inRange ? "bg-accent text-navy" : "bg-destructive/5 text-navy")}>{inRange ? "Latest value is inside the agreed target range." : "Latest value is outside the agreed target range."} {item.note}</p>
      </> : <div className="grid gap-3 sm:grid-cols-3">
        <ContextTile label={`Previous · ${item.previousDate}`} value={item.previousLabel || "—"}/>
        <ContextTile label="Latest" value={item.latestLabel || item.status}/>
        <ContextTile label="Status" value={item.status}/>
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground sm:col-span-3">{item.note}</p>
      </div>}
    </div>}
  </article>;
}

function PageIntro({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Patient workspace</p><h2 className="mt-1 text-2xl font-bold text-navy">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>; }

function InvestigationsPage({ patient, filter, setFilter, onAdd }: { patient: Patient; filter: string; setFilter: (v: string) => void; onAdd: () => void }) {
  const [open, setOpen] = useState<string[]>([patient.comparisons[0]?.name ?? ""]);
  const statuses = ["All", ...Array.from(new Set(patient.comparisons.map((c) => c.status)))];
  const shown = patient.comparisons.filter((c) => filter === "All" || c.status === filter);
  const improved = patient.comparisons.filter((c) => changeOf(c)?.improved).length;
  const worse = patient.comparisons.filter((c) => { const change = changeOf(c); return change && !change.improved && !change.flat; }).length;
  const pending = patient.comparisons.filter((c) => c.latest === null).length;
  return <div className="w-full">
    <PageIntro title="Investigations" description={`Compare ${patient.name.split(" ")[0]}’s previous consultation with the latest results.`} action={<Button onClick={onAdd}><Plus/>Assign investigation</Button>}/>
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryTile icon={TrendingDown} value={String(improved)} label="Improved since last visit" tone="metric-green"/>
      <SummaryTile icon={TrendingUp} value={String(worse)} label="Moved away from target" tone="metric-amber"/>
      <SummaryTile icon={Clock3} value={String(pending)} label="Awaiting result" tone="metric-blue"/>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2">{statuses.map((x) => <Button key={x} size="sm" variant={filter === x ? "default" : "outline"} onClick={() => setFilter(x)}>{x}</Button>)}<Button size="sm" variant="ghost" className="ml-auto" onClick={() => setOpen(open.length ? [] : patient.comparisons.map((c) => c.name))}>{open.length ? "Collapse all" : "Expand all"}</Button></div>
    <div className="mt-4 space-y-3">{shown.length ? shown.map((item) => <ComparisonCard key={item.name} item={item} open={open.includes(item.name)} onToggle={() => setOpen((current) => current.includes(item.name) ? current.filter((n) => n !== item.name) : [...current, item.name])}/>) : <EmptyState title="No investigations found" note="Try a different status filter."/>}</div>
  </div>;
}

function CarePlan({ patient, medications, tasks, setTasks, onAdd, onFollow }: { patient: Patient; medications: Medication[]; tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; onAdd: (m: SimpleModal) => void; onFollow: () => void }) {
  return <><PageIntro title="Care Plan" description={`Manage the treatment plan agreed with ${patient.name.split(" ")[0]}.`}/><div className="grid gap-4 lg:grid-cols-2"><CareSection icon={<Pill/>} title="Current Medications" action="Add medication" onAction={() => onAdd("medication")}>{medications.map((m) => <div key={m.name} className="data-row"><div><strong>{m.name}</strong><p>{m.dosage} · {m.frequency}</p></div><div className="flex items-center gap-2"><span className="status-dot"><Check/> {m.status}</span><Button size="sm" variant="outline" onClick={() => onAdd("medication")}>Edit</Button></div></div>)}</CareSection><CareSection icon={<ClipboardCheck/>} title="Patient Tasks" action="Add task" onAction={() => onAdd("task")}>{tasks.map((t, index) => <Button key={t.title} variant="ghost" className="data-row h-auto w-full text-left" onClick={() => setTasks((current) => current.map((task, i) => i === index ? {...task, done: !task.done} : task))}><div><strong className={cn(t.done && "text-muted-foreground line-through")}>{t.title}</strong><p>{t.note} · Patient</p></div>{t.done ? <CheckCheck className="text-primary"/> : <ChevronRight/>}</Button>)}</CareSection><CareSection icon={<FlaskConical/>} title="Investigations" action="Assign investigation" onAction={() => onAdd("investigation")}>{patient.comparisons.slice(0,3).map((i) => <Button key={i.name} variant="ghost" className="data-row h-auto w-full text-left" onClick={() => onAdd("investigation")}><div><strong>{i.name}</strong><p>{i.latest === null ? "Awaiting result" : `Last ${i.latestDate}`}</p></div><span className="text-sm text-muted-foreground">{i.status}</span></Button>)}</CareSection><CareSection icon={<CalendarDays/>} title="Follow-up" action="Assign follow-up" onAction={onFollow}><Button variant="ghost" className="h-auto w-full whitespace-normal rounded-xl bg-muted/60 p-4 text-left" onClick={onFollow}><div><strong className="block text-navy">{patient.followUp}</strong><p className="mt-1 text-sm text-muted-foreground">{patient.followUpStatus} · assigned by Dr. Priya Sharma</p></div><ChevronRight className="ml-auto"/></Button></CareSection></div></>;
}
function CareSection({ icon, title, action, onAction, children }: { icon: ReactNode; title: string; action: string; onAction: () => void; children: ReactNode }) { return <section className="panel p-5"><div className="mb-4 flex items-center justify-between"><h3 className="section-title">{icon}{title}</h3><Button variant="outline" size="sm" onClick={onAction}><Plus/>{action}</Button></div><div className="space-y-2">{children}</div></section>; }
function VisitsPage({ patient, onDetail }: { patient: Patient; onDetail: (d: Detail) => void }) { return <><PageIntro title="Previous Visits" description="Consultation history, kept within the patient context."/><div className="space-y-4">{patient.visits.map((v) => <article key={v.date} className="panel p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><time className="text-xs font-semibold text-primary">{v.date}</time><h3 className="mt-1 text-lg font-semibold text-navy">{v.title}</h3><p className="mt-3 text-sm text-muted-foreground">{v.summary}</p><ul className="mt-3 flex flex-wrap gap-2">{v.actions.map((a) => <li key={a} className="tag">{a}</li>)}</ul></div><Button variant="outline" className="shrink-0" onClick={() => onDetail({ kind: "visit", title: v.title, subtitle: `${patient.name} · ${v.date}` })}>View consultation <ArrowRight/></Button></div></article>)}</div></>; }
function NotesPage({ patient, notes, onAdd }: { patient: Patient; notes: Note[]; onAdd: () => void }) { return <><PageIntro title="Notes" description={`Clinical notes for ${patient.name}, kept separate from measurements and reports.`} action={<Button onClick={onAdd}><Plus/>Add note</Button>}/><section className="panel divide-y divide-border/60">{notes.map((n) => <article key={`${n.date}-${n.text}`} className="p-5 sm:p-6"><div className="flex justify-between"><div><time className="text-xs font-semibold text-primary">{n.date}</time><p className="mt-1 text-sm font-medium">{n.author}</p></div><Button size="icon" variant="ghost" aria-label="Edit note"><MoreHorizontal/></Button></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{n.text}</p></article>)}</section></>; }

function PracticeDashboard({ onNavigate, onSelectPatient }: { onNavigate: (to: "/patients" | "/follow-ups" | "/messages") => void; onSelectPatient: (p: Patient) => void }) {
  const cards = [
    { label: "Consultations today", value: "8", note: "3 remaining", icon: Stethoscope, tone: "blue", to: "/patients" as const },
    { label: "Follow-ups this week", value: "12", note: "4 overdue", icon: CalendarCheck, tone: "amber", to: "/follow-ups" as const },
    { label: "Patients in care", value: "48", note: "4 seen this week", icon: Users, tone: "cyan", to: "/patients" as const },
    { label: "Unread messages", value: "3", note: "2 patient replies", icon: MessageSquare, tone: "green", to: "/messages" as const },
  ];
  return <div className="pt-7">
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4"><img src={priyaImage} alt="Dr. Priya Sharma" className="size-16 rounded-full object-cover ring-4 ring-card sm:size-20"/><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Practice overview</p><h2 className="mt-1 text-2xl font-bold text-navy">Good morning, Dr. Priya</h2><p className="mt-1 text-sm text-muted-foreground">Here’s what needs your attention on Friday, 25 September.</p></div></div>
      <Button className="bg-navy hover:bg-navy/90" onClick={() => onNavigate("/follow-ups")}><CalendarDays/>View follow-ups</Button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <MetricCard key={card.label} label={card.label} value={card.value} note={card.note} date="View details" icon={card.icon} tone={card.tone} onClick={() => onNavigate(card.to)}/>)}</div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <section className="panel p-5"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">Today’s schedule</h2><Button variant="ghost" size="sm" onClick={() => onNavigate("/follow-ups")}>View all <ArrowRight/></Button></div>{patients.map((item) => <Button key={item.id} variant="ghost" className="h-auto w-full justify-start gap-4 border-b border-border/50 px-1 py-3 text-left last:border-0" onClick={() => onSelectPatient(item)}><span className="w-16 text-xs font-semibold text-primary">{item.slot}</span><span className="grid size-9 place-items-center rounded-full bg-accent font-semibold text-primary">{initials(item.name)}</span><span className="min-w-0 flex-1"><span className="block font-medium">{item.name}</span><span className="block text-xs text-muted-foreground">{item.condition} · Follow-up</span></span><ChevronRight/></Button>)}</section>
      <section className="panel p-5"><h2 className="section-title">Needs attention</h2><div className="mt-3 space-y-2"><AttentionRow icon={AlertCircle} title="1 overdue follow-up" note="Neha Gupta · overdue by 13 days" onClick={() => onNavigate("/follow-ups")}/><AttentionRow icon={FlaskConical} title="3 results to review" note="Received since yesterday" onClick={() => onNavigate("/patients")}/><AttentionRow icon={MessageSquare} title="3 unread messages" note="Latest received 18 minutes ago" onClick={() => onNavigate("/messages")}/></div></section>
    </div>
  </div>;
}

function AttentionRow({ icon: Icon, title, note, onClick }: { icon: typeof AlertCircle; title: string; note: string; onClick: () => void }) { return <Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-lg bg-muted/60 p-3 text-left" onClick={onClick}><span className="grid size-9 place-items-center rounded-lg bg-card text-primary"><Icon/></span><span className="flex-1"><span className="block font-medium">{title}</span><span className="block text-xs font-normal text-muted-foreground">{note}</span></span><ChevronRight/></Button>; }

function FollowUpsPage({ onAssign, onOpenPatient }: { onAssign: () => void; onOpenPatient: (p: Patient) => void }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const shown = patients.filter((item) => (filter === "All" || item.followUpStatus === filter) && item.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="pt-7"><PageIntro title="Follow-ups" description="View and manage your patients’ follow-up appointments." action={<Button className="bg-navy hover:bg-navy/90" onClick={onAssign}><Plus/>Assign follow-up</Button>}/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryTile icon={CalendarDays} value="2" label="Due this week" tone="metric-blue"/><SummaryTile icon={AlertCircle} value="1" label="Overdue" tone="metric-amber"/><SummaryTile icon={CalendarCheck} value="1" label="Upcoming" tone="metric-cyan"/><SummaryTile icon={CheckCheck} value="32" label="Completed this month" tone="metric-green"/></div><section className="panel mt-4 overflow-hidden"><div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{["All","Due this week","Overdue","Upcoming"].map((item) => <Button key={item} variant={filter === item ? "default" : "ghost"} size="sm" onClick={() => setFilter(item)}>{item}</Button>)}</div><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9 lg:w-64" placeholder="Search follow-ups"/></div></div><div className="hidden grid-cols-[1.4fr_.8fr_.7fr_.6fr_auto] gap-4 bg-muted/60 px-5 py-3 text-xs font-semibold text-muted-foreground md:grid"><span>Patient</span><span>Condition</span><span>Next follow-up</span><span>Status</span><span>Action</span></div>{shown.length ? shown.map((item) => <div key={item.id} className="grid gap-3 border-t border-border/60 p-4 first:border-0 md:grid-cols-[1.4fr_.8fr_.7fr_.6fr_auto] md:items-center md:px-5"><div className="flex items-center gap-3">{item.image ? <img src={item.image} alt={item.name} className="size-10 rounded-full object-cover"/> : <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-primary">{initials(item.name)}</span>}<div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.age} yrs · {item.gender} · UHID: {item.id}</p></div></div><span className="text-sm">{item.condition}</span><span className="flex items-center gap-2 text-sm"><CalendarDays className="size-4 text-muted-foreground"/>{item.followUp}</span><span className={cn("w-fit rounded-md px-2.5 py-1 text-xs", item.followUpStatus === "Overdue" ? "bg-destructive/10 text-destructive" : item.followUpStatus === "Due this week" ? "bg-accent text-primary" : "bg-muted text-muted-foreground")}>{item.followUpStatus}</span><Button variant="outline" size="sm" onClick={() => onOpenPatient(item)}>View <ArrowRight/></Button></div>) : <EmptyState title="No follow-ups found" note="Try another status or patient name."/>}</section></div>;
}

function SummaryTile({ icon: Icon, value, label, tone }: { icon: typeof CalendarDays; value:string; label:string; tone:string }) { return <div className={cn("metric-card flex items-center gap-4 p-4", tone)}><span className="metric-icon"><Icon/></span><div><strong className="text-2xl text-navy">{value}</strong><p className="text-xs text-muted-foreground">{label}</p></div></div>; }

function PracticeInvestigations({ onAssign, onOpenPatient }: { onAssign: () => void; onOpenPatient: (p: Patient) => void }) {
  const records = patients.flatMap((patient) => patient.comparisons.map((c) => ({ patient, test: c.name, ordered: c.previousDate, result: c.latest !== null ? `${c.latest}${c.unit}` : c.latestLabel ?? "Pending", status: c.status, note: c.note })));
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof records)[number] | null>(null);
  const statuses = ["All", ...Array.from(new Set(records.map((r) => r.status)))];
  const shown = records.filter((r) => filter === "All" || r.status === filter);
  return <div className="pt-7"><PageIntro title="Investigations" description="Track assigned tests, incoming results, and completed reviews." action={<Button onClick={onAssign}><Plus/>Assign investigation</Button>}/><div className="grid gap-3 sm:grid-cols-3"><SummaryTile icon={FlaskConical} value={String(records.filter((r) => r.status === "Results received").length)} label="Results received" tone="metric-blue"/><SummaryTile icon={Clock3} value={String(records.filter((r) => r.status === "Pending").length)} label="Awaiting sample" tone="metric-amber"/><SummaryTile icon={CheckCheck} value="28" label="Reviewed this month" tone="metric-green"/></div><section className="panel mt-4 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div className="flex flex-wrap gap-2">{statuses.map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "ghost"} onClick={() => setFilter(item)}>{item}</Button>)}</div><Button variant="outline" size="sm" onClick={() => setFilter("All")}><Filter/>Clear filters</Button></div><div className="hidden grid-cols-[1.1fr_1fr_.8fr_.7fr_.7fr_auto] gap-4 bg-muted/60 px-5 py-3 text-xs font-semibold text-muted-foreground md:grid"><span>Patient</span><span>Investigation</span><span>Previous</span><span>Latest</span><span>Status</span><span>Action</span></div>{shown.map((record) => <div key={`${record.patient.id}-${record.test}`} className="grid gap-3 border-t border-border/60 p-4 md:grid-cols-[1.1fr_1fr_.8fr_.7fr_.7fr_auto] md:items-center md:px-5"><Button variant="ghost" className="h-auto justify-start p-0 text-left" onClick={() => onOpenPatient(record.patient)}><span><span className="block text-sm font-semibold">{record.patient.name}</span><span className="block text-xs font-normal text-muted-foreground">UHID: {record.patient.id}</span></span></Button><span className="text-sm font-medium">{record.test}</span><span className="text-sm text-muted-foreground">{record.ordered}</span><span className="text-sm font-semibold">{record.result}</span><span className="text-xs text-muted-foreground">{record.status}</span><Button variant="outline" size="sm" onClick={() => setSelected(record)}>{record.status === "Results received" ? "Review" : "View"}<ArrowRight/></Button></div>)}</section><Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><SheetContent className="bg-card"><SheetHeader className="pt-6"><SheetTitle>{selected?.test}</SheetTitle><SheetDescription>{selected?.patient.name} · {selected?.patient.id}</SheetDescription></SheetHeader><div className="mt-8 space-y-3"><ContextTile label="Latest" value={selected?.result || "Pending"}/><ContextTile label="Status" value={selected?.status || ""}/><ContextTile label="Clinical note" value={selected?.note || ""}/><Field label="Review note"><Textarea placeholder="Add a clinical review note"/></Field><Button className="w-full" onClick={() => setSelected(null)}><Check/>Mark reviewed</Button></div></SheetContent></Sheet></div>;
}

function MessagesPage() {
  const initialThread = inbox[0] ?? { name: "Asha Sharma", preview: "", time: "", unread: 0 };
  const [selected, setSelected] = useState(initialThread);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const threads = inbox.filter((thread) => thread.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="pt-7"><PageIntro title="Messages" description="Secure conversations with patients and the care team." action={<Button onClick={() => { setSelected(initialThread); setDraft(""); }}><Plus/>New message</Button>}/><section className="panel grid min-h-[650px] overflow-hidden lg:grid-cols-[340px_1fr]"><aside className="border-b border-border lg:border-b-0 lg:border-r"><div className="relative p-4"><Search className="absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search conversations"/></div><div>{threads.map((thread) => <Button key={thread.name} variant="ghost" onClick={() => setSelected(thread)} className={cn("h-auto w-full justify-start gap-3 rounded-none border-t border-border/60 p-4 text-left", selected.name === thread.name && "bg-accent")}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-card font-semibold text-primary">{initials(thread.name)}</span><span className="min-w-0 flex-1"><span className="flex justify-between gap-2"><strong className="text-sm">{thread.name}</strong><span className="text-xs font-normal text-muted-foreground">{thread.time}</span></span><span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{thread.preview}</span></span>{thread.unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{thread.unread}</span>}</Button>)}</div></aside><div className="flex min-h-[500px] flex-col"><header className="flex items-center gap-3 border-b border-border p-4"><span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-primary">{initials(selected.name)}</span><div className="flex-1"><h2 className="font-semibold">{selected.name}</h2><p className="text-xs text-muted-foreground">Patient · Usually replies within a day</p></div><Button size="icon" variant="ghost" aria-label="Start voice call"><Phone/></Button><Button size="icon" variant="ghost" aria-label="Start video call"><Video/></Button></header><div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-5"><p className="text-center text-xs text-muted-foreground">Today</p><div className="max-w-[75%] rounded-lg rounded-tl-none bg-card p-3 text-sm shadow-sm">{selected.preview || "Hello doctor."}<p className="mt-1 text-right text-xs text-muted-foreground">{selected.time}</p></div><div className="ml-auto max-w-[75%] rounded-lg rounded-tr-none bg-primary p-3 text-sm text-primary-foreground">Thank you. I’ll review this today and message you here if anything needs clarification.<p className="mt-1 text-right text-xs opacity-80">10:48 · Read</p></div>{sent.map((message, index) => <div key={`${message}-${index}`} className="ml-auto max-w-[75%] rounded-lg rounded-tr-none bg-primary p-3 text-sm text-primary-foreground">{message}<p className="mt-1 text-right text-xs opacity-80">Now · Sent</p></div>)}</div><form className="flex items-end gap-2 border-t border-border p-4" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { setSent((current) => [...current, draft.trim()]); setDraft(""); } }}><Button type="button" size="icon" variant="ghost" aria-label="Attach file"><Paperclip/></Button><Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-11 resize-none" placeholder={`Message ${selected.name}`}/><Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message"><Send/></Button></form></div></section></div>;
}

function EmptyState({ title, note }: { title:string; note:string }) { return <div className="grid place-items-center px-4 py-16 text-center"><Search className="mb-3 size-7 text-muted-foreground"/><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{note}</p></div>; }

function NotificationsSheet({ open, onOpenChange }: { open:boolean; onOpenChange:(open:boolean)=>void }) { return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="bg-card"><SheetHeader className="pt-6"><SheetTitle>Notifications</SheetTitle><SheetDescription>Updates that need your attention.</SheetDescription></SheetHeader><div className="mt-6 space-y-2"><AttentionRow icon={FlaskConical} title="New HbA1c result" note="Asha Sharma · 18 minutes ago" onClick={() => onOpenChange(false)}/><AttentionRow icon={MessageSquare} title="New patient message" note="Raj Mehta · 1 hour ago" onClick={() => onOpenChange(false)}/><AttentionRow icon={CalendarDays} title="Follow-up overdue" note="Neha Gupta · 13 days overdue" onClick={() => onOpenChange(false)}/></div><Button variant="outline" className="mt-6 w-full" onClick={() => onOpenChange(false)}><CheckCheck/>Mark all as read</Button></SheetContent></Sheet>; }
function ProfileDialog({ open, onOpenChange }: { open:boolean; onOpenChange:(open:boolean)=>void }) { return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Dr. Priya Sharma</DialogTitle><DialogDescription>Endocrinologist · Avenn Care</DialogDescription></DialogHeader><div className="flex items-center gap-4 rounded-lg bg-muted p-4"><img src={priyaImage} alt="Dr. Priya Sharma" className="size-16 rounded-full object-cover"/><div><p className="font-semibold">Dr. Priya Sharma</p><p className="text-sm text-muted-foreground">priya.sharma@avenn.care</p></div></div><div className="grid gap-2"><Button variant="outline" className="justify-start" onClick={() => onOpenChange(false)}><Settings/>Account settings</Button><Button variant="outline" className="justify-start" onClick={() => onOpenChange(false)}><Mail/>Notification preferences</Button></div></DialogContent></Dialog>; }

function FollowUpDialog({ open, onOpenChange, patient, date, setDate, onSave }: { open:boolean;onOpenChange:(v:boolean)=>void;patient:Patient;date:string;setDate:(v:string)=>void;onSave:()=>void }) { return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="rounded-2xl sm:max-w-md"><DialogHeader><DialogTitle>Assign Follow-up</DialogTitle><DialogDescription>Choose the next visit with {patient.name}.</DialogDescription></DialogHeader><div className="space-y-4"><Field label="Patient"><Input value={patient.name} readOnly/></Field><Field label="Next follow-up"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)}/></Field><Field label="Reason"><Input defaultValue="Routine diabetes follow-up"/></Field><Field label="Notes"><Textarea placeholder="Optional notes"/></Field><div className="rounded-lg bg-muted p-3 text-sm"><span className="text-muted-foreground">Assigned by</span><strong className="ml-2">Dr. Priya Sharma</strong></div></div><DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onSave} disabled={!date}>Save Follow-up</Button></DialogFooter></DialogContent></Dialog>; }

function ConsultationDialog({ open, onOpenChange, patient, step, setStep, onComplete }: { open:boolean;onOpenChange:(v:boolean)=>void;patient:Patient;step:number;setStep:(s:number)=>void;onComplete:()=>void }) { const labels=["Patient context","Consultation","Care plan","Review"]; return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-3xl"><DialogHeader><DialogTitle>Consultation · {patient.name}</DialogTitle><DialogDescription>Record the visit and agree the next care plan.</DialogDescription></DialogHeader><div className="grid grid-cols-4 gap-2">{labels.map((l,i)=><div key={l} className={cn("rounded-lg border p-2 text-center text-xs", step===i+1?"border-primary bg-accent text-primary":"border-border text-muted-foreground")}><span className="font-semibold">{i+1}</span><span className="hidden sm:inline"> · {l}</span></div>)}</div><div className="min-h-72 py-2">{step===1&&<div className="grid gap-3 sm:grid-cols-2"><ContextTile label="Patient" value={`${patient.name} · ${patient.age} yrs · ${patient.gender}`}/><ContextTile label="Condition" value={patient.condition}/><ContextTile label="Latest HbA1c" value={`${patient.metrics[0]?.value} · ${patient.metrics[0]?.date}`}/><ContextTile label="Latest glucose" value={`${patient.metrics[1]?.value} · ${patient.metrics[1]?.date}`}/><ContextTile label="Previous consultation" value={`${patient.visits[0]?.date} · ${patient.visits[0]?.title}`}/></div>}{step===2&&<div className="space-y-4"><Field label="Reason for visit"><Input placeholder="Routine follow-up"/></Field><Field label="Clinical notes"><Textarea className="min-h-24" placeholder="Record observations from the consultation"/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Assessment"><Textarea placeholder="Clinical assessment"/></Field><Field label="Plan"><Textarea placeholder="Agreed plan"/></Field></div></div>}{step===3&&<div className="grid gap-3 sm:grid-cols-2">{[[Pill,"Medication"],[FlaskConical,"Investigation"],[ClipboardCheck,"Patient task"],[CalendarDays,"Follow-up"]].map(([Icon,label])=>{const I=Icon as typeof Pill;return <Button key={label as string} variant="outline" className="h-24 justify-start rounded-xl p-4"><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><I/></span><span className="text-base">Add {label as string}</span><Plus className="ml-auto"/></Button>})}</div>}{step===4&&<div className="space-y-3"><ContextTile label="Visit" value="Routine diabetes follow-up"/><ContextTile label="Recorded" value="Clinical notes, assessment and care plan"/><div className="rounded-xl border border-primary/20 bg-accent p-4"><p className="font-medium text-navy">Ready to complete</p><p className="mt-1 text-sm text-muted-foreground">This consultation will be added to Previous Visits.</p></div></div>}</div><DialogFooter><Button variant="ghost" onClick={() => step>1?setStep(step-1):onOpenChange(false)}><ArrowLeft/>{step>1?"Back":"Cancel"}</Button>{step<4?<Button onClick={()=>setStep(step+1)}>Continue <ArrowRight/></Button>:<Button onClick={onComplete}><Check/>Complete Consultation</Button>}</DialogFooter></DialogContent></Dialog>; }

function SimpleFormDialog({ type, onClose, onSave }: { type: SimpleModal; onClose: () => void; onSave: (value: string) => void }) {
  const [value, setValue] = useState("");
  const config: Record<Exclude<SimpleModal, null>, { title: string; description: string; label: string; placeholder: string }> = {
    medication: { title: "Add medication", description: "Add a medication to the care plan.", label: "Medication", placeholder: "e.g. Metformin 500 mg" },
    investigation: { title: "Assign investigation", description: "Assign a new investigation to this patient.", label: "Investigation", placeholder: "e.g. HbA1c" },
    task: { title: "Add patient task", description: "Tasks appear in the patient’s care plan.", label: "Task", placeholder: "e.g. Record fasting glucose" },
    note: { title: "Add note", description: "Clinical notes are visible to the care team.", label: "Note", placeholder: "Write the note" },
  };
  const current = type ? config[type] : null;
  return <Dialog open={Boolean(type)} onOpenChange={(open) => { if (!open) { setValue(""); onClose(); } }}><DialogContent className="rounded-2xl sm:max-w-md"><DialogHeader><DialogTitle>{current?.title}</DialogTitle><DialogDescription>{current?.description}</DialogDescription></DialogHeader><Field label={current?.label ?? ""}>{type === "note" ? <Textarea className="min-h-28" value={value} onChange={(e) => setValue(e.target.value)} placeholder={current?.placeholder}/> : <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={current?.placeholder}/>}</Field><DialogFooter><Button variant="ghost" onClick={() => { setValue(""); onClose(); }}>Cancel</Button><Button onClick={() => { onSave(value); setValue(""); }}>Save</Button></DialogFooter></DialogContent></Dialog>;
}

function DetailDrawer({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  return <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && onClose()}><SheetContent className="bg-card"><SheetHeader className="pt-6"><SheetTitle>{detail?.title}</SheetTitle><SheetDescription>{detail?.subtitle}</SheetDescription></SheetHeader><div className="mt-8 space-y-3"><ContextTile label="Type" value={detail?.kind ?? ""}/><ContextTile label="Recorded by" value="Dr. Priya Sharma"/><p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Full details are kept inside the patient record so the care team sees the same information.</p><Button variant="outline" className="w-full" onClick={onClose}>Close</Button></div></SheetContent></Sheet>;
}

function ContextTile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium text-navy">{value}</p></div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-2"><span className="text-sm font-medium">{label}</span>{children}</label>; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
