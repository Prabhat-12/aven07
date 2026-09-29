import { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAccount } from "@/lib/account";
import type { WorkspacePage } from "@/components/avenn-dashboard";

const AvennDashboard = lazy(() => import("@/components/avenn-dashboard").then((m) => ({ default: m.AvennDashboard })));
const ReceptionistView = lazy(() => import("@/components/receptionist-view").then((m) => ({ default: m.ReceptionistView })));
const PatientHome = lazy(() => import("@/components/patient-home").then((m) => ({ default: m.PatientHome })));

const Splash = () => <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading your workspace…</div>;

// Each role only ever loads its own view. The database enforces the same limits.
export function AppEntry({ page }: { page: WorkspacePage }) {
  const navigate = useNavigate();
  const account = useAccount();
  const data = account.data;

  useEffect(() => {
    if (account.isSuccess && data && !data.role) navigate({ to: "/onboarding", replace: true });
    if (account.isSuccess && !data) navigate({ to: "/auth", replace: true });
  }, [account.isSuccess, data, navigate]);

  if (account.isLoading || !data || !data.role) return <Splash />;

  return (
    <Suspense fallback={<Splash />}>
      {data.role === "doctor" && <AvennDashboard initialPage={page} />}
      {data.role === "receptionist" && <ReceptionistView />}
      {data.role === "patient" && <PatientHome />}
    </Suspense>
  );
}
