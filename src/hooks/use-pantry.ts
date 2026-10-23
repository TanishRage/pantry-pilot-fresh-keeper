import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ItemInput, ItemStatus, PantryItem } from "@/lib/pantry";

export const pantryQuery = queryOptions({
  queryKey: ["pantry_items"],
  queryFn: async (): Promise<PantryItem[]> => {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .order("expires_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as PantryItem[];
  },
});

export function usePantry() {
  return useQuery(pantryQuery);
}

function toRow(input: ItemInput) {
  return {
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit,
    category: input.category,
    storage: input.storage,
    expires_at: input.expires_at ? input.expires_at : null,
  };
}

export function usePantryMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: pantryQuery.queryKey });
  const fail = (e: Error) => toast.error("Something went wrong", { description: e.message });

  const create = useMutation({
    mutationFn: async (input: ItemInput) => {
      const { error } = await supabase.from("pantry_items").insert(toRow(input));
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Item added"); done(); },
    onError: fail,
  });
  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ItemInput }) => {
      const { error } = await supabase.from("pantry_items").update(toRow(input)).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Item updated"); done(); },
    onError: fail,
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ItemStatus }) => {
      const { error } = await supabase.from("pantry_items").update({ status }).eq("id", id);
      if (error) throw error;
      return status;
    },
    onSuccess: (s) => { toast.success(s === "used" ? "Nice — marked as used" : "Marked as wasted"); done(); },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pantry_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Item deleted"); done(); },
    onError: fail,
  });
  return { create, update, setStatus, remove };
}
