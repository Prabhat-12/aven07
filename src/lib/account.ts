import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type Role = "doctor" | "receptionist" | "patient";
export type Profile = {
  id: string; email: string; full_name: string; specialty: string | null; clinic: string | null;
  dob: string | null; height_cm: number | null; weight_kg: number | null; doctor_id: string | null; approved: boolean;
};
export type Account = { userId: string; email: string; role: Role | null; profile: Profile | null };

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async (): Promise<Account | null> => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const [roles, profile] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      return {
        userId: user.id,
        email: user.email ?? "",
        role: (roles.data?.[0]?.role as Role | undefined) ?? null,
        profile: (profile.data as Profile | null) ?? null,
      };
    },
    staleTime: 60_000,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}

export const roleLabel: Record<Role, string> = { doctor: "Doctor", receptionist: "Receptionist", patient: "Patient" };
