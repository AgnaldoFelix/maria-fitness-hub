import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSettings() {
  return useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("configuracoes").select("*");
      if (error) throw error;
      
      // Convert to key-value object
      const settings: Record<string, string> = {};
      data?.forEach((item) => {
        settings[item.chave] = item.valor;
      });
      
      return settings;
    },
  });
}
