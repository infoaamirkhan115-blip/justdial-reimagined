import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getFavourite, setFavourite } from "@/lib/favourites.functions";
import { Btn } from "./ui";
export function SaveBusiness({ id }: { id: string }) {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const load = useServerFn(getFavourite);
  const save = useServerFn(setFavourite);
  const [busy, setBusy] = useState(false);
  const key = ["favourite", user?.id, id];
  const state = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    queryFn: () => load({ data: { businessId: id } }),
  });
  const change = useCallback(async (saved: boolean) => {
    setBusy(true);
    try {
      await save({ data: { businessId: id, saved } });
      qc.setQueryData(["favourite", user?.id, id], saved);
      sessionStorage.removeItem("pendingFavourite");
      toast.success(saved ? "Business saved" : "Business removed from saved");
    } catch {
      toast.error("Couldn't update saved businesses. Please retry.");
    } finally {
      setBusy(false);
    }
  }, [save, qc, user?.id, id]);
  useEffect(() => {
    if (user && state.isSuccess && sessionStorage.getItem("pendingFavourite") === id) {
      if (state.data) sessionStorage.removeItem("pendingFavourite");
      else void change(true);
    }
  }, [user, state.isSuccess, state.data, id, change]);
  return (
    <Btn
      variant="outline"
      disabled={loading || busy || (Boolean(user) && state.isPending)}
      aria-pressed={Boolean(state.data)}
      onClick={() => {
        if (!user) {
          sessionStorage.setItem("pendingFavourite", id);
          nav({ to: "/auth", search: { redirect: `/business/${id}` } });
        } else if (state.isError) {
          void state.refetch();
        } else void change(!state.data);
      }}
    >
      <Bookmark className={state.data ? "size-4 fill-current" : "size-4"} />
      {busy ? "Saving…" : state.isError ? "Retry saved status" : state.data ? "Saved" : "Save"}
    </Btn>
  );
}
