import type { ReactNode } from "react";
import { Activity, CalendarDays, HeartPulse, ShieldCheck } from "lucide-react";

export function EntryLayout({ children, step, guest = false }: { children: ReactNode; step?: number; guest?: boolean }) {
  return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[40%_60%]">
      <aside className="relative flex flex-col overflow-hidden border-b border-border bg-secondary px-6 py-7 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
        <div className="flex items-center gap-2 text-2xl font-bold text-navy"><span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><HeartPulse className="size-5" /></span>Aven</div>
        <div className="my-auto py-8 lg:py-12">
          <p className="text-xs font-bold uppercase text-foreground">Care, between visits</p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight text-navy sm:text-4xl lg:text-5xl">A clearer picture of every next step.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">One thoughtful place for appointments, care plans and the conversations that keep people connected.</p>
          <div className="mt-10 hidden max-w-md rounded-md border border-border bg-card p-5 lg:block" aria-hidden="true">
            <div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-xs text-muted-foreground">Today at a glance</p><p className="mt-1 font-semibold text-navy">Your care workspace</p></div><span className="grid size-9 place-items-center rounded-md bg-secondary text-foreground"><Activity className="size-5" /></span></div>
            <div className="mt-4 flex items-center gap-4"><span className="grid size-10 place-items-center rounded-full bg-secondary text-foreground"><CalendarDays className="size-5" /></span><div className="flex-1"><p className="text-sm font-semibold text-navy">Follow-up scheduled</p><p className="text-xs text-muted-foreground">Care continues beyond the visit</p></div><span className="size-2 rounded-full bg-primary" /></div>
            <div className="mt-4 h-1 rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
          </div>
        </div>
        <p className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><ShieldCheck className="size-4" />{guest ? "Fictional examples only. No clinic data is used." : "Your role determines what information you can access."}</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-8 sm:px-12 lg:px-16 lg:py-12"><div className="w-full max-w-xl">{step && <div className="mb-10 flex items-center gap-3 text-xs font-semibold uppercase text-foreground"><span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">{step}</span><span>Step {step} of 2</span><span className="ml-auto text-muted-foreground">{guest ? "Guest preview" : "Account setup"}</span></div>}{children}</div></main>
    </div>
  </div>;
}
