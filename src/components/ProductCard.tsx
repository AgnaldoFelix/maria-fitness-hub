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
  whatsapp_numero = "5511999999999",
}: ProductCardProps) {
  const handleComprar = () => {
    const mensagem = mensagem_whatsapp || 
      `Olá Maria! Tenho interesse em adquirir o produto ${nome}. Pode me informar mais detalhes sobre disponibilidade e forma de pagamento?`;
    const encodedMessage = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${whatsapp_numero}?text=${encodedMessage}`, "_blank");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-elevated animate-fade-in">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={foto_url || "/placeholder.svg"}
          alt={nome}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground line-clamp-1">
            {nome}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
            {descricao}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg text-primary">
            {formatPrice(preco)}
          </span>
          <Button
            onClick={handleComprar}
            size="sm"
            className="bg-success hover:bg-success/90 text-success-foreground gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
