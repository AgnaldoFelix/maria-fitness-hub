import { useState, useMemo, useDeferredValue } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

import { Search, Loader2, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";
import { ProductCard } from "@/components/products/ProductCard";
import { CheckoutModal } from "@/components/checkout/CheckoutModalPix";
import { PixModal } from "@/components/checkout/PixModal";

export default function Produtos() {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const { data: products = [], isLoading } = useProducts(true);
  const { data: settings } = useSettings();

  const whatsappNumero = settings?.whatsapp_numero || "5579996848609";

  // Função para verificar se um desconto está ativo
  const isDescontoAtivo = (product: any) => {
    if (!product.desconto_ativo || !product.desconto_percentual || product.desconto_percentual <= 0) {
      return false;
    }
    
    const hoje = new Date();
    const inicio = product.data_desconto_inicio ? new Date(product.data_desconto_inicio) : null;
    const fim = product.data_desconto_fim ? new Date(product.data_desconto_fim) : null;
    
    // Se não tem datas, considera válido apenas pelo status ativo
    if (!inicio || !fim) {
      return product.desconto_ativo && product.desconto_percentual > 0;
    }
    
    return hoje >= inicio && hoje <= fim;
  };

  const filteredAndSortedProducts = useMemo(() => {
    // Primeiro filtrar pela busca
    const filtered = products.filter((product) => {
      if (!deferredSearch) return true;
      return (
        product.nome.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        product.descricao.toLowerCase().includes(deferredSearch.toLowerCase())
      );
    });

    // Ordenar: produtos com desconto ativo primeiro (maior desconto primeiro),
    // depois produtos sem desconto
    return filtered.sort((a, b) => {
      const aTemDesconto = isDescontoAtivo(a);
      const bTemDesconto = isDescontoAtivo(b);
      
      if (aTemDesconto && !bTemDesconto) return -1;
      if (!aTemDesconto && bTemDesconto) return 1;
      if (aTemDesconto && bTemDesconto) {
        // Ordenar por maior desconto percentual
        return (b.desconto_percentual || 0) - (a.desconto_percentual || 0);
      }
      return 0;
    });
  }, [products, deferredSearch]);

  // Contar produtos com desconto ativo
  const produtosComDesconto = filteredAndSortedProducts.filter(isDescontoAtivo).length;

  return (
    <div className="min-h-screen bg-background safe-pb">
      <Header subtitle="Produtos Fit" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-base"
              aria-label="Buscar produtos"
            />
          </div>
          
          {/* Indicador de promoções */}
          {produtosComDesconto > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {produtosComDesconto} produto{produtosComDesconto !== 1 ? 's' : ''} em promoção!
              </span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <>
                <div className="overflow-y-auto max-h-[70vh] grid grid-cols-2 gap-3 pb-[40px]">
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      nome={product.nome}
                      descricao={product.descricao}
                      preco={Number(product.preco)}
                      foto_url={product.foto_url || ""}
                      mensagem_whatsapp={product.mensagem_whatsapp || undefined}
                      whatsapp_numero={whatsappNumero}
                      desconto_percentual={product.desconto_percentual}
                      desconto_ativo={product.desconto_ativo}
                      preco_original={product.preco_original}
                      data_desconto_inicio={product.data_desconto_inicio}
                      data_desconto_fim={product.data_desconto_fim}
                    />
                  ))}
                </div>
                
                {/* Contador de produtos - Centralizado */}
                <div className=" mb-[75px] text-center">
                  <p className="text-sm text-muted-foreground">
                    {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-muted-foreground">
                  {deferredSearch
                    ? "Tente buscar com outros termos"
                    : "Nenhum produto cadastrado ainda"}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}