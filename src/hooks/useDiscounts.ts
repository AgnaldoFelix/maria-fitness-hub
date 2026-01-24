import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./useProducts";

export interface DiscountData {
  desconto_percentual: number;
  desconto_ativo: boolean;
  preco_original: number;
  data_desconto_inicio: string;
  data_desconto_fim: string;
}

export interface DiscountHistoryEntry {
  id: string;
  desconto_anterior: number | null;
  desconto_novo: number;
  data_alteracao: string;
  ativo: boolean;
}

export function useUpdateProductDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      discountData,
    }: {
      productId: string;
      discountData: DiscountData;
    }) => {
      // Validações
      if (discountData.desconto_percentual < 0 || discountData.desconto_percentual > 100) {
        throw new Error("Desconto deve estar entre 0% e 100%");
      }

      if (discountData.preco_original <= 0) {
        throw new Error("Preço original deve ser maior que zero");
      }

      const dataInicio = new Date(discountData.data_desconto_inicio);
      const dataFim = new Date(discountData.data_desconto_fim);
      
      if (dataFim <= dataInicio) {
        throw new Error("Data de fim deve ser posterior à data de início");
      }

      // Buscar desconto anterior
      const { data: currentProduct, error: fetchError } = await supabase
        .from("produtos")
        .select("desconto_percentual, desconto_historico")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      // Preparar histórico
      const historicoAtual = Array.isArray(currentProduct?.desconto_historico)
        ? currentProduct.desconto_historico
        : [];

      const novaEntradaHistorico: DiscountHistoryEntry = {
        id: `${Date.now()}`,
        desconto_anterior: currentProduct?.desconto_percentual || null,
        desconto_novo: discountData.desconto_percentual,
        data_alteracao: new Date().toISOString(),
        ativo: discountData.desconto_ativo,
      };

      const historicoAtualizado = [novaEntradaHistorico, ...historicoAtual].slice(0, 10); // Manter últimas 10

      // Atualizar produto
      const { data, error } = await supabase
        .from("produtos")
        .update({
          desconto_percentual: discountData.desconto_percentual,
          desconto_ativo: discountData.desconto_ativo,
          preco_original: discountData.preco_original,
          data_desconto_inicio: discountData.data_desconto_inicio,
          data_desconto_fim: discountData.data_desconto_fim,
          desconto_historico: historicoAtualizado,
        })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useRemoveProductDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: currentProduct, error: fetchError } = await supabase
        .from("produtos")
        .select("desconto_percentual, desconto_historico")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      const historicoAtual = Array.isArray(currentProduct?.desconto_historico)
        ? currentProduct.desconto_historico
        : [];

      const entradaRemocao: DiscountHistoryEntry = {
        id: `${Date.now()}`,
        desconto_anterior: currentProduct?.desconto_percentual || null,
        desconto_novo: 0,
        data_alteracao: new Date().toISOString(),
        ativo: false,
      };

      const historicoAtualizado = [entradaRemocao, ...historicoAtual].slice(0, 10);

      const { data, error } = await supabase
        .from("produtos")
        .update({
          desconto_percentual: 0,
          desconto_ativo: false,
          preco_original: null,
          desconto_historico: historicoAtualizado,
        })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}