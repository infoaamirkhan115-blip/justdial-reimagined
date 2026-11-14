import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "business_owner" | "user";
type AuthCtx = { user: User | null; roles: Role[]; loading: boolean; isAdmin: boolean; isStaff: boolean; signOut: () => Promise<void> };
const Ctx = createContext<AuthCtx>({ user: null, roles: [], loading: true, isAdmin: false, isStaff:false, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStaff,setIsStaff]=useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, qc]);

  useEffect(() => {
    if (!user) { setRoles([]); setIsStaff(false); return; }
    supabase.rpc("is_staff").then(({data})=>setIsStaff(Boolean(data)));
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => setRoles((data ?? []).map((r) => r.role as Role)));
  }, [user]);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return <Ctx.Provider value={{ user, roles, loading, isAdmin: roles.includes("admin"), isStaff, signOut }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
