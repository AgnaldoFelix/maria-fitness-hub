import { useState, useMemo, useDeferredValue } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";

export default function Produtos() {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const { data: products = [], isLoading } = useProducts(true);
  const { data: settings } = useSettings();

  const whatsappNumero = settings?.whatsapp_numero || "55079996848609";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!deferredSearch) return true;
      return (
        product.nome.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        product.descricao.toLowerCase().includes(deferredSearch.toLowerCase())
      );
    });
  }, [products, deferredSearch]);

  return (
    <div className="min-h-screen bg-background safe-pb ">
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
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="overflow-y-auto max-h-[70vh] grid grid-cols-2 gap-2 pb-[30px]">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    nome={product.nome}
                    descricao={product.descricao}
                    preco={Number(product.preco)}
                    foto_url={product.foto_url || ""}
                    mensagem_whatsapp={product.mensagem_whatsapp || undefined}
                    whatsapp_numero={whatsappNumero}
                  />
                ))}
              </div>
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
