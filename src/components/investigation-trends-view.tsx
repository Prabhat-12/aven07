import { useState } from "react";
import { Activity, ArrowRight, CalendarDays, ChevronRight, Clock3, FlaskConical, Info, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatReading, investigationCategories, investigationRecords, readingChange, visibleReadings, type InvestigationCategory, type InvestigationRecord, type InvestigationReading } from "@/lib/investigation-trends";
import type { Patient } from "@/lib/patient-types";

type Props = { patient: Patient; onAdd: () => void; onOverview: () => void };

function ChangeLabel({ change, unit }: { change: number | null; unit: string }) {
  if (change === null) return <span className="text-xs text-muted-foreground">No comparison</span>;
  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground"><Icon className="size-3.5" />{change === 0 ? "No change" : `${change > 0 ? "+" : ""}${formatReading(change, unit)}`}</span>;
}

function MiniTrend({ readings }: { readings: InvestigationReading[] }) {
  if (readings.length < 2) return null;
  return <span className="hidden h-9 w-16 shrink-0 sm:block" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><LineChart data={readings}><Line type="monotone" dataKey="value" stroke="var(--success)" strokeWidth={1.6} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></span>;
}

function LatestDetails({ record, readings }: { record: InvestigationRecord; readings: InvestigationReading[] }) {
  const { item } = record;
  const latest = readings.at(-1);
  const change = readingChange(readings);
  return <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
    <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-foreground"><FlaskConical className="size-5" /></span><div className="min-w-0"><h3 className="text-lg font-semibold text-foreground">{item.name}</h3><p className="text-xs text-muted-foreground">{latest ? `Latest reading · ${latest.label}` : item.latestDate || "No dated result"}</p></div></div>
    <div className="text-right">{latest ? <><p className="text-2xl font-semibold text-foreground">{formatReading(latest.value, item.unit)}</p><ChangeLabel change={change} unit={item.unit} /></> : <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-muted-foreground"><Clock3 className="size-4" />{item.latestLabel ?? item.status}</span>}</div>
  </div>;
}

export function InvestigationTrendsView({ patient, onAdd, onOverview }: Props) {
  const records = investigationRecords(patient);
  const [category, setCategory] = useState<InvestigationCategory>(records[0]?.category ?? "HbA1c");
  const [selectedName, setSelectedName] = useState(records[0]?.item.name ?? "");
  const [range, setRange] = useState("6");
  const selected = records.find((record) => record.item.name === selectedName);
  const categoryRecords = records.filter((record) => record.category === category);
  const shown = selected ? visibleReadings(selected.readings, Number(range)) : [];
  const change = readingChange(shown);
  const latest = shown.at(-1);
  const chartData = shown.map((reading) => ({ label: reading.label, value: reading.value }));
  const selectCategory = (next: InvestigationCategory) => {
    setCategory(next);
    setSelectedName(records.find((record) => record.category === next)?.item.name ?? "");
  };
  const selectRecord = (record: InvestigationRecord) => {
    setCategory(record.category);
    setSelectedName(record.item.name);
  };
  const summary = !selected || selected.item.status === "Pending" || !latest
    ? `${selected?.item.name ?? "Investigation"} is awaiting a recorded result.`
    : change === null ? `One ${selected.item.name} reading is available in this period; no change can be calculated.`
    : change === 0 ? `${selected.item.name} is unchanged from the previous recorded reading.`
    : `${selected.item.name} ${change > 0 ? "increased" : "decreased"} by ${formatReading(Math.abs(change), selected.item.unit)} from the previous recorded reading.`;

  return <div className="w-full min-w-0">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-bold text-foreground">Investigations</h2><p className="mt-1 text-sm text-muted-foreground">Track trends and compare recorded results.</p></div><Button onClick={onAdd}><Plus />Assign investigation</Button></div>
    {records.length === 0 ? <div className="rounded-lg border border-border bg-card p-10 text-center"><p className="font-semibold">No investigations yet</p><p className="mt-1 text-sm text-muted-foreground">Assigned investigations and results will appear here.</p></div> : <>
      <div className="mb-3 flex flex-col gap-3 rounded-lg border border-border bg-card p-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-1 overflow-x-auto" role="group" aria-label="Investigation categories">{investigationCategories.map((name) => <Button key={name} size="sm" variant={category === name ? "secondary" : "ghost"} aria-pressed={category === name} className={cn("shrink-0", category === name && "bg-accent text-foreground hover:bg-accent")} onClick={() => selectCategory(name)}>{name}</Button>)}</div><Select value={range} onValueChange={setRange}><SelectTrigger className="w-full shrink-0 sm:w-36" aria-label="Trend time range"><CalendarDays className="size-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="6">Last 6 months</SelectItem><SelectItem value="12">Last 1 year</SelectItem></SelectContent></Select></div>
      {categoryRecords.length === 0 && <p className="mb-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No investigations recorded in {category}.</p>}
      {selected && categoryRecords.length > 0 && <><div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(290px,1fr)]">
        <section className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5" aria-label={`${selected.item.name} results`}>
          <LatestDetails record={selected} readings={shown} />
          {shown.length >= 2 ? <div role="img" aria-label={`${selected.item.name} trend from ${shown[0]?.label} to ${latest?.label}`} className="mt-5 h-64 w-full sm:h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 14, right: 12, bottom: 0, left: -22 }}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} minTickGap={18} /><YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={44} /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6 }} formatter={(value) => [formatReading(Number(value), selected.item.unit), selected.item.name]} /><Area type="monotone" dataKey="value" stroke="var(--success)" strokeWidth={2.5} fill="var(--quiet-lime)" dot={{ r: 3, fill: "var(--success)" }} activeDot={{ r: 5 }} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
            : <div className="my-6 flex min-h-52 flex-col items-center justify-center gap-2 rounded-md bg-secondary px-5 text-center"><Activity className="size-6 text-muted-foreground" /><p className="font-medium">{shown.length ? "More readings needed for a trend" : selected.item.status === "Pending" ? "Awaiting result" : "No dated readings available"}</p><p className="max-w-sm text-sm text-muted-foreground">{selected.item.note}</p></div>}
          <div className="mt-5"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Recent results</h3><span className="text-xs text-muted-foreground">{shown.length} recorded {shown.length === 1 ? "reading" : "readings"}</span></div>
            {shown.length ? <div className="overflow-x-auto"><table className="w-full min-w-[330px] border-collapse text-left text-xs"><thead className="bg-secondary text-muted-foreground"><tr><th className="px-3 py-2 font-medium">Date</th><th className="px-3 py-2 font-medium">Result</th><th className="px-3 py-2 font-medium">Change</th></tr></thead><tbody>{[...shown].reverse().map((reading, index) => { const previous = shown[shown.length - index - 2]; const delta = previous ? Number((reading.value - previous.value).toFixed(2)) : null; return <tr key={`${reading.label}-${index}`} className="border-t border-border"><td className="px-3 py-2 text-muted-foreground">{reading.label}</td><td className="px-3 py-2 font-semibold">{formatReading(reading.value, selected.item.unit)}</td><td className="px-3 py-2"><ChangeLabel change={delta} unit={selected.item.unit} /></td></tr>; })}</tbody></table></div> : <p className="py-5 text-sm text-muted-foreground">No results recorded for this period.</p>}
          </div>
        </section>
        <aside className="min-w-0 rounded-lg border border-border bg-card p-3 sm:p-4"><h3 className="px-2 pb-2 text-base font-semibold">All investigations</h3><div className="divide-y divide-border">{records.map((record) => { const recordReadings = visibleReadings(record.readings, Number(range)); const recordLatest = recordReadings.at(-1); const active = record.item.name === selected.item.name; return <Button key={record.item.name} variant="ghost" aria-current={active ? "true" : undefined} onClick={() => selectRecord(record)} className={cn("h-auto w-full min-w-0 justify-start gap-2 rounded-md px-2 py-3 text-left whitespace-normal", active && "bg-accent hover:bg-accent")}><span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary"><FlaskConical className="size-4" /></span><span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{record.item.name}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{recordLatest ? formatReading(recordLatest.value, record.item.unit) : record.item.latestLabel ?? record.item.status}</span></span><MiniTrend readings={recordReadings} /><span className="hidden shrink-0 sm:block"><ChangeLabel change={readingChange(recordReadings)} unit={record.item.unit} /></span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></Button>; })}</div></aside>
      </div><div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-quiet-lime p-4 sm:flex-row sm:items-center"><Info className="size-5 shrink-0 text-success" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{summary}</p><p className="mt-0.5 text-xs text-muted-foreground">Review in context with other recorded information.</p></div><Button variant="outline" onClick={onOverview} className="shrink-0 bg-card">View clinical summary <ArrowRight /></Button></div></>}
    </>}
  </div>;
}
