import type { Patient, Comparison, Metric, Point } from "@/lib/patient-types";
import { guestCareTasks } from "@/lib/care-loop";

// Public, fictional examples only. These identifiers intentionally cannot claim clinic records.
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const trend = (values: number[]): Point[] => values.map((value, index) => ({ month: months[index] ?? "Sep", value }));
const examples = [
  { appt: "Confirmed", name: "Maya Verma", id: "GUEST-MV-01", age: 48, gender: "Female", slot: "09:30", iso: "2026-10-03", status: "Due this week", hba1c: 7.4, egfr: 84, weight: 68, bp: "128/82", cholesterol: 194, medication: "Metformin", values: [8.9,8.6,8.3,8.1,7.9,7.7,7.5,7.3,7.4], note: "Review daily walking and meal timing at the next follow-up." },
  { appt: "Waiting", name: "Arjun Nair", id: "GUEST-AN-02", age: 55, gender: "Male", slot: "11:00", iso: "2026-10-15", status: "Upcoming", hba1c: 8.0, egfr: 76, weight: 82, bp: "134/86", cholesterol: 208, medication: "Glimepiride", values: [9.2,9.1,9.0,8.8,8.7,8.5,8.4,8.2,8.0], note: "Discuss glucose readings and reinforce the agreed activity plan." },
  { appt: "Scheduled", name: "Leena Rao", id: "GUEST-LR-03", age: 61, gender: "Female", slot: "14:15", iso: "2026-09-12", status: "Lost to Follow-up", hba1c: 9.1, egfr: 58, weight: 74, bp: "142/90", cholesterol: 216, medication: "Metformin", values: [8.2,8.3,8.4,8.6,8.7,8.8,9.0,9.0,9.1], note: "Offer a convenient follow-up time and review kidney function." },
];

export const guestPatients: Patient[] = examples.map((e) => {
  const metrics: Metric[] = [
    { label: "HbA1c", value: `${e.hba1c}%`, note: "", date: "18 Sep 2026", icon: "FlaskConical", tone: "blue" },
    { label: "eGFR", value: `${e.egfr} mL/min`, note: "", date: "18 Sep 2026", icon: "Activity", tone: "amber" },
    { label: "Weight", value: `${e.weight} kg`, note: "", date: "18 Sep 2026", icon: "Weight", tone: "cyan" },
    { label: "Blood Pressure", value: e.bp, note: "", date: "18 Sep 2026", icon: "HeartPulse", tone: "green" },
  ];
  const comparisons: Comparison[] = [
    { name: "HbA1c", unit: "%", previous: e.hba1c + 0.3, latest: e.hba1c, previousDate: "18 Jun 2026", latestDate: "18 Sep 2026", low: 4, high: 7, max: 12, lowerIsBetter: true, status: "Results received", note: "Review the change since the previous consultation.", icon: "FlaskConical" },
    { name: "2-hr Post-prandial Glucose", unit: "mg/dL", previous: 204, latest: 188, previousDate: "18 Jun 2026", latestDate: "18 Sep 2026", low: 80, high: 140, max: 350, lowerIsBetter: true, status: "Results received", note: "Measured two hours after the main meal.", icon: "Activity" },
    { name: "eGFR", unit: "mL/min", previous: e.egfr - 2, latest: e.egfr, previousDate: "18 Jun 2026", latestDate: "18 Sep 2026", low: 60, high: 120, max: 120, lowerIsBetter: false, status: "Results received", note: "Kidney function estimate reviewed during follow-up.", icon: "FileText" },
    { name: "Ophthalmology Consult", unit: "", previous: null, latest: null, previousLabel: "Last year", latestLabel: "Awaiting visit", previousDate: "2025", latestDate: "Assigned Sep 2026", low: 0, high: 0, max: 0, lowerIsBetter: true, status: "Pending", note: "Annual eye examination is due.", icon: "Stethoscope" },
  ];
  return {
    dbId: e.id, id: e.id, name: e.name, phone: "Not available in guest preview", age: e.age, gender: e.gender, condition: "Type 2 Diabetes", tags: ["T2D", "Sample record"], slot: e.slot,
    followUp: new Date(`${e.iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }), followUpIso: e.iso, followUpStatus: e.status,
    summary: `${e.name} is a fictional example patient in the Avenn guest preview. Review trends and plan the next follow-up.`, metrics, trend: trend(e.values), creatTrend: trend([0.9,0.9,1,0.9,1,1,1,1,1]),
    cholesterol: { value: e.cholesterol, date: "18 Sep 2026", trend: trend([225,220,217,212,207,201,e.cholesterol,e.cholesterol,e.cholesterol]) }, comparisons,
    tasks: [{ title: "Regular Follow-up", note: "", done: false, kind: "follow-up" }, { title: "Lifestyle Modification", note: "Daily walking plan", done: false }],
    medications: [{ name: e.medication, dosage: "500 mg", frequency: "BD", status: "Active" }],
    activities: [{ date: "18 Sep 2026", title: "Lab result received", note: `HbA1c · ${e.hba1c}%` }],
    visits: [{ date: "18 Jun 2026", title: "Routine follow-up", summary: "Care plan and daily activity reviewed.", actions: ["Care plan reviewed", "Follow-up scheduled"] }],
    notes: [{ date: "18 Sep 2026", author: "Dr. Isha Mehta", text: e.note }], rawData: {},
    careTasks: guestCareTasks(e.id), checkins: [], appointmentStatus: e.appt,
  };
});

export const guestDefaults = {
  doctor: { fullName: "Dr. Isha Mehta", specialty: "Endocrinology", clinic: "Avenn Sample Clinic", doctorEmail: "", uhid: "", phone: "", dob: "", height: "", weight: "" },
  receptionist: { fullName: "Samira Das", specialty: "", clinic: "Avenn Sample Clinic", doctorEmail: "isha@example.invalid", uhid: "", phone: "", dob: "", height: "", weight: "" },
  patient: { fullName: "Maya Verma", specialty: "", clinic: "", doctorEmail: "", uhid: "GUEST-MV-01", phone: "00000 00000", dob: "1978-04-16", height: "162", weight: "68" },
};
