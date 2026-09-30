import type { Comparison, Patient, Point } from "@/lib/patient-types";

export type InvestigationCategory = "HbA1c" | "Glucose" | "Kidney Function" | "Lipids" | "Others";
export type InvestigationReading = { date: Date; label: string; value: number };
export type InvestigationRecord = { item: Comparison; category: InvestigationCategory; readings: InvestigationReading[] };
export const investigationCategories: InvestigationCategory[] = ["HbA1c", "Glucose", "Kidney Function", "Lipids", "Others"];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function categoryFor(name: string): InvestigationCategory {
  if (/hba1c/i.test(name)) return "HbA1c";
  if (/glucose|glyc|post-prandial|fasting/i.test(name)) return "Glucose";
  if (/egfr|creatinine|kidney|renal/i.test(name)) return "Kidney Function";
  if (/cholesterol|lipid|triglyceride|hdl|ldl/i.test(name)) return "Lipids";
  return "Others";
}

function parseDate(label: string): Date | null {
  const date = new Date(label);
  return Number.isNaN(date.getTime()) ? null : date;
}

function seriesReadings(series: Point[], latestDate: string): InvestigationReading[] {
  const last = parseDate(latestDate);
  if (!last) return [];
  let year = last.getFullYear();
  let nextMonth = last.getMonth() + 1;
  const reversed = [...series].reverse().map((point) => {
    const month = months.indexOf(point.month.slice(0, 3));
    if (month < 0 || !Number.isFinite(point.value)) return null;
    if (month >= nextMonth) year -= 1;
    nextMonth = month;
    const date = new Date(year, month, 1);
    return { date, label: `${months[month]} ${year}`, value: point.value };
  });
  return reversed.reverse().filter((reading): reading is InvestigationReading => reading !== null);
}

function comparisonReadings(item: Comparison): InvestigationReading[] {
  return [
    { value: item.previous, label: item.previousDate },
    { value: item.latest, label: item.latestDate },
  ].flatMap(({ value, label }) => {
    const date = parseDate(label);
    return value !== null && Number.isFinite(value) && date ? [{ date, label, value }] : [];
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function investigationRecords(patient: Patient): InvestigationRecord[] {
  const comparisons = [...patient.comparisons];
  // Older signed-in records store these series separately from the comparison list.
  if (patient.creatTrend.length && !comparisons.some((item) => /creatinine/i.test(item.name))) {
    comparisons.push({ name: "Serum Creatinine", icon: "Activity", unit: "mg/dL", previous: null, latest: null, previousDate: "", latestDate: patient.metrics[0]?.date ?? "", low: 0, high: 0, max: 0, lowerIsBetter: false, status: "Results received", note: "Recorded creatinine trend.", latestLabel: "Trend available" });
  }
  if (patient.cholesterol.trend.length && !comparisons.some((item) => /cholesterol/i.test(item.name))) {
    comparisons.push({ name: "Total Cholesterol", icon: "Droplet", unit: "mg/dL", previous: null, latest: null, previousDate: "", latestDate: patient.cholesterol.date, low: 0, high: 0, max: 0, lowerIsBetter: true, status: "Results received", note: "Recorded cholesterol trend.", latestLabel: "Trend available" });
  }
  return comparisons.map((item) => {
    const series = item.name === "HbA1c" ? patient.trend
      : /creatinine/i.test(item.name) ? patient.creatTrend
      : /cholesterol/i.test(item.name) ? patient.cholesterol.trend
      : patient.investigationTrends?.[item.name] ?? [];
    const readings = series.length ? seriesReadings(series, item.latestDate) : comparisonReadings(item);
    return { item, category: categoryFor(item.name), readings };
  });
}

export function visibleReadings(readings: InvestigationReading[], monthsBack: number): InvestigationReading[] {
  const last = readings.at(-1)?.date;
  if (!last) return [];
  const cutoff = new Date(last.getFullYear(), last.getMonth() - monthsBack + 1, 1);
  return readings.filter((reading) => reading.date >= cutoff);
}

export function readingChange(readings: InvestigationReading[]) {
  const latest = readings.at(-1);
  const previous = readings.at(-2);
  if (!latest || !previous) return null;
  return Number((latest.value - previous.value).toFixed(2));
}

export function formatReading(value: number, unit: string) {
  return `${value}${unit === "%" ? "%" : unit ? ` ${unit}` : ""}`;
}
