import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto_url: string;
  mensagem_whatsapp?: string;
  whatsapp_numero?: string;
}

export function ProductCard({
  nome,
  descricao,
  preco,
  foto_url,
  mensagem_whatsapp,
  whatsapp_numero = "5579996848609",
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleComprar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mensagem = mensagem_whatsapp || 
      `*Olá Maria!* Tenho interesse em adquirir o produto *${nome}*. Pode me informar mais detalhes sobre disponibilidade e forma de pagamento?`;
    const encodedMessage = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${5579996848609}?text=${encodedMessage}`, "_blank");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-[0.98] animate-fade-in h-full flex flex-col touch-manipulation">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        <img
          src={foto_url || "/placeholder.svg"}
          alt={nome}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="lazy"
        />
      </div>
      <CardContent className="p-3 flex flex-col flex-grow">
        <div className="mb-2 flex-grow">
          <h3 className="font-medium text-foreground line-clamp-1 text-sm sm:text-base">
            {nome}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mt-1">
            {descricao}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-primary text-sm sm:text-base">
            {formatPrice(preco)}
          </span>
          <Button
            onClick={handleComprar}
            size="sm"
            className="bg-success hover:bg-success/90 text-success-foreground gap-1 px-1 py-1 min-h-[36px]"
            aria-label={`Comprar ${nome}`}
          >
            <MessageCircle className="w-2.5 h-2.5" />
            <span className="text-xs sm:text-sm">Comprar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}