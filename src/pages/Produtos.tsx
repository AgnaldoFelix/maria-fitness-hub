import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";

export default function Produtos() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: products = [], isLoading } = useProducts(true);
  const { data: settings } = useSettings();

  const whatsappNumero = settings?.whatsapp_numero || "5511999999999";

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header subtitle="Produtos Fit" />
      
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-3">
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
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum produto encontrado.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
