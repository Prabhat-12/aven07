import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, LogOut, Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useSignOut } from "@/lib/account";
import { followUpStatusFor, formatIso, STATUS_LOST } from "@/lib/patient-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";

type Row = { id: string; name: string; follow_up_date: string | null; follow_up_status: string };
const filters = ["All", "Due this week", "Upcoming", STATUS_LOST];

// Receptionists only ever request name and follow-up schedule columns.
export function ReceptionistView() {
  const account = useAccount();
  const signOut = useSignOut();
  const queryClient = useQueryClient();
  const approved = account.data?.profile?.approved ?? false;
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [date, setDate] = useState("");

  const rows = useQuery({
    queryKey: ["reception-schedule"],
    enabled: approved,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.from("patients").select("id, name, follow_up_date, follow_up_status").order("follow_up_date");
      if (error) throw error;
      return data as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const { error } = await supabase.from("patients").update({ follow_up_date: date, follow_up_status: followUpStatusFor(date) }).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => { setEditing(null); queryClient.invalidateQueries({ queryKey: ["reception-schedule"] }); },
  });

  const list = rows.data ?? [];
  const visible = useMemo(() => list.filter((r) => (filter === "All" || r.follow_up_status === filter) && r.name.toLowerCase().includes(search.toLowerCase())), [list, filter, search]);
  const count = (s: string) => list.filter((r) => r.follow_up_status === s).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-8">
        <span className="text-2xl font-bold text-navy">Avenn</span>
        <div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:block">{account.data?.profile?.full_name} · Receptionist</span><Button variant="outline" size="sm" onClick={signOut}><LogOut />Sign out</Button></div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {!approved ? (
          <section className="panel mx-auto mt-10 max-w-lg p-8 text-center"><Clock className="mx-auto size-8 text-primary" /><h1 className="mt-4 text-xl font-bold text-navy">Waiting for approval</h1><p className="mt-2 text-sm text-muted-foreground">Your doctor needs to approve your account before you can see the follow-up schedule. Check back once they have.</p><Button className="mt-5" variant="outline" onClick={() => account.refetch()}>Check again</Button></section>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-navy">Follow-up schedule</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" />You can see patient names and follow-up dates only.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Due this week", count("Due this week")], ["Upcoming", count("Upcoming")], [STATUS_LOST, count(STATUS_LOST)], ["All patients", list.length]].map(([label, value]) => (
                <div key={label} className="panel p-4"><strong className="text-2xl text-navy">{value}</strong><p className="text-xs text-muted-foreground">{label}</p></div>
              ))}
            </div>
            <section className="panel mt-6 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">{filters.map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>)}</div>
                <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search patient name" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              </div>
              <div className="mt-4 divide-y divide-border/60">
                {rows.isLoading && <p className="p-6 text-sm text-muted-foreground">Loading schedule…</p>}
                {!rows.isLoading && visible.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No patients match this view.</p>}
                {visible.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="grid size-10 place-items-center rounded-full bg-accent text-sm font-semibold text-primary">{r.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
                    <strong className="min-w-32 flex-1 text-navy">{r.name}</strong>
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
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {save.isError && <p role="alert" className="text-sm text-destructive">Could not save. Please try again.</p>}
          <Button disabled={!date || save.isPending} onClick={() => save.mutate()}>Save date</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
