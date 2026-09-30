import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Clock, LogOut, MoreHorizontal, Phone, Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useSignOut } from "@/lib/account";
import { APPOINTMENT_STATUSES } from "@/lib/care-loop";
import { followUpStatusFor, formatIso, STATUS_LOST } from "@/lib/patient-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";

export type ScheduleRow = { id: string; name: string; follow_up_date: string | null; follow_up_status: string; appointment_status: string; appointment_time: string | null; contact_phone: string | null };
type Row = ScheduleRow;
const filters = ["All", "Due this week", "Upcoming", STATUS_LOST];
const columns = "id, name, follow_up_date, follow_up_status, appointment_status, appointment_time, contact_phone";

// Receptionists only ever request names, contact details and appointment columns. Clinical tables are blocked by the database.
export function ReceptionistView({ guestRows, onGuestRowsChange, guestName }: { guestRows?: Row[]; onGuestRowsChange?: (rows: Row[]) => void; guestName?: string } = {}) {
  const account = useAccount(!guestRows);
  const signOut = useSignOut();
  const queryClient = useQueryClient();
  const approved = guestRows ? true : (account.data?.profile?.approved ?? false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [contact, setContact] = useState<Row | null>(null);
  const [record, setRecord] = useState<Row | null>(null);
  const [date, setDate] = useState("");
  const [feedback, setFeedback] = useState("");

  const rows = useQuery({
    queryKey: ["reception-schedule"],
    enabled: approved && !guestRows,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.from("patients").select(columns).order("follow_up_date");
      if (error) throw error;
      return data as Row[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ row, patch }: { row: Row; patch: Partial<Row> }) => {
      if (guestRows) { onGuestRowsChange?.(guestRows.map((r) => (r.id === row.id ? { ...r, ...patch } : r))); return; }
      const { error } = await supabase.from("patients").update(patch).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => { setEditing(null); queryClient.invalidateQueries({ queryKey: ["reception-schedule"] }); },
    onError: () => setFeedback("We couldn't update that appointment. Nothing was changed. Please try again."),
  });

  const setStatus = (row: Row, status: string) => { setFeedback(`${row.name}: ${status}`); update.mutate({ row, patch: { appointment_status: status } }); };
  const reschedule = () => { if (editing) { setFeedback(`${editing.name} rescheduled to ${formatIso(date)}`); update.mutate({ row: editing, patch: { follow_up_date: date, follow_up_status: followUpStatusFor(date), appointment_status: "Scheduled" } }); } };

  const list = guestRows ?? rows.data ?? [];
  const visible = useMemo(() => list.filter((r) => (filter === "All" || r.follow_up_status === filter) && r.name.toLowerCase().includes(search.toLowerCase())), [list, filter, search]);
  const today = useMemo(() => list.filter((r) => r.appointment_time).sort((a, b) => (a.appointment_time ?? "").localeCompare(b.appointment_time ?? "")), [list]);
  const count = (s: string) => list.filter((r) => r.follow_up_status === s).length;
  const loading = !guestRows && rows.isLoading;

  const Actions = ({ r }: { r: Row }) => (
    <div className="flex items-center gap-2">
      {r.appointment_status === "Arrived" || r.appointment_status === "Waiting" || r.appointment_status === "Completed" || r.appointment_status === "No-show" ? null : r.appointment_status === "Confirmed" ? <Button size="sm" variant="outline" onClick={() => setStatus(r, "Arrived")}>Mark arrived</Button> : <Button size="sm" variant="outline" onClick={() => setStatus(r, "Confirmed")}><Check />Confirm</Button>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`More actions for ${r.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => { setEditing(r); setDate(r.follow_up_date ?? ""); }}>Reschedule</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setStatus(r, "Arrived")}>Mark arrived</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setStatus(r, "Waiting")}>Mark waiting</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setStatus(r, "Completed")}>Mark completed</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setStatus(r, "No-show")}>Mark no-show</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setContact(r)}>Contact patient</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFeedback(`Message sent to the clinic team about ${r.name}. No details were shared.`)}>Contact clinic team</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const Status = ({ s }: { s: string }) => <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-navy"><Check className="size-3" />{s}</span>;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-8">
        <span className="text-2xl font-bold text-navy">Avenn</span>
        <div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:block">{guestRows ? guestName : account.data?.profile?.full_name} · Receptionist</span>{!guestRows && <Button variant="outline" size="sm" onClick={signOut}><LogOut />Sign out</Button>}</div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {!approved ? (
          <section className="panel mx-auto mt-10 max-w-lg p-8 text-center"><Clock className="mx-auto size-8 text-primary" /><h1 className="mt-4 text-xl font-bold text-navy">Waiting for approval</h1><p className="mt-2 text-sm text-muted-foreground">Your doctor needs to approve your account before you can see the follow-up schedule. Check back once they have.</p><Button className="mt-5" variant="outline" onClick={() => account.refetch()}>Check again</Button></section>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-navy">Follow-up schedule</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage appointments and follow-up coordination.</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" />You can see patient names and follow-up dates only.</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border/70 py-4 sm:grid-cols-4">
              {[["Due this week", count("Due this week")], ["Upcoming", count("Upcoming")], [STATUS_LOST, count(STATUS_LOST)], ["Today's appointments", today.length]].map(([label, value]) => (
                <div key={label}><dd className="text-2xl font-semibold text-navy">{value}</dd><dt className="text-xs text-muted-foreground">{label}</dt></div>
              ))}
            </dl>
            {feedback && <p role="status" className="mt-4 rounded-md border border-primary/20 bg-accent px-4 py-3 text-sm text-navy">{feedback}</p>}

            <section className="mt-7" aria-labelledby="today-heading">
              <h2 id="today-heading" className="text-lg font-semibold text-navy">Today's appointments</h2>
              <div className="mt-2 divide-y divide-border/60 border-y border-border/60">
                {loading && <div className="space-y-2 py-4" aria-busy="true"><div className="h-8 animate-pulse rounded bg-muted" /><div className="h-8 animate-pulse rounded bg-muted" /></div>}
                {!loading && today.length === 0 && <p className="py-5 text-sm text-muted-foreground">No appointments are scheduled for today.</p>}
                {today.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="w-14 text-sm font-semibold text-primary">{r.appointment_time}</span>
                    <button type="button" className="min-w-32 flex-1 text-left font-medium text-navy hover:underline" onClick={() => setRecord(r)}>{r.name}</button>
                    <Status s={r.appointment_status} />
                    <Actions r={r} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8" aria-labelledby="followups-heading">
              <h2 id="followups-heading" className="text-lg font-semibold text-navy">Follow-ups</h2>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">{filters.map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>)}</div>
                <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" aria-label="Search patient name" placeholder="Search patient name" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              </div>
              <div className="mt-3 divide-y divide-border/60 border-y border-border/60">
                {!loading && visible.length === 0 && (filter === STATUS_LOST ? <div className="py-8 text-center"><p className="font-medium text-navy">No overdue follow-ups</p><p className="text-sm text-muted-foreground">Everyone is currently on schedule.</p></div> : <p className="py-6 text-center text-sm text-muted-foreground">No patients match this view.</p>)}
                {visible.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-primary">{r.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
                    <button type="button" className="min-w-32 flex-1 text-left font-medium text-navy hover:underline" onClick={() => setRecord(r)}>{r.name}</button>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />{formatIso(r.follow_up_date)}</span>
                    <StatusBadge status={r.follow_up_status} />
                    <Button size="sm" variant="outline" onClick={() => { setEditing(r); setDate(r.follow_up_date ?? ""); }}>Reschedule</Button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Reschedule follow-up</DialogTitle><DialogDescription>{editing?.name}</DialogDescription></DialogHeader>
          <Input type="date" aria-label="New follow-up date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button disabled={!date || update.isPending} onClick={reschedule}>Save date</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!contact} onOpenChange={(o) => !o && setContact(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Contact patient</DialogTitle><DialogDescription>Use this only to arrange or confirm an appointment.</DialogDescription></DialogHeader>
          <p className="flex items-center gap-2 text-navy"><Phone className="size-4 text-primary" /><strong>{contact?.name}</strong></p>
          <p className="text-sm text-muted-foreground">{contact?.contact_phone ?? "No phone number on record."}</p>
          <Button variant="outline" onClick={() => { if (contact) setStatus(contact, contact.appointment_status === "Scheduled" ? "Reschedule requested" : contact.appointment_status); setContact(null); }}>Note: patient contacted</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!record} onOpenChange={(o) => !o && setRecord(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{record?.name}</DialogTitle><DialogDescription>Appointment record</DialogDescription></DialogHeader>
          <dl className="divide-y divide-border/60 text-sm">
            {[["Contact", record?.contact_phone ?? "Not on record"], ["Follow-up date", formatIso(record?.follow_up_date)], ["Follow-up status", record?.follow_up_status ?? ""], ["Today's time", record?.appointment_time ?? "Not scheduled today"], ["Appointment status", record?.appointment_status ?? ""]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium text-navy">{v}</dd></div>)}
          </dl>
          <p className="text-xs text-muted-foreground">Clinical information is not available in this view. Statuses: {APPOINTMENT_STATUSES.join(", ")}.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
