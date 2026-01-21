import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Recipe = Tables<"receitas">;
export type RecipeInsert = TablesInsert<"receitas">;
export type RecipeUpdate = TablesUpdate<"receitas">;

export function useRecipes(publishedOnly = true) {
  return useQuery({
    queryKey: ["receitas", publishedOnly],
    queryFn: async () => {
      let query = supabase.from("receitas").select("*").order("created_at", { ascending: false });
      
      if (publishedOnly) {
        query = query.eq("publicada", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Recipe[];
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recipe: RecipeInsert) => {
      const { data, error } = await supabase.from("receitas").insert(recipe).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: RecipeUpdate & { id: string }) => {
      const { data, error } = await supabase.from("receitas").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("receitas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
    },
  });
}
