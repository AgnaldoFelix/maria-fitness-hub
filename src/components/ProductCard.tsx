import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface ProductCardProps {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto_url: string;
  mensagem_whatsapp?: string;
  whatsapp_numero?: string;
  desconto_percentual?: number;
  desconto_ativo?: boolean;
  preco_original?: number;
  data_desconto_inicio?: string;
  data_desconto_fim?: string;
}

export function ProductCard({
  nome,
  descricao,
  preco,
  foto_url,
  mensagem_whatsapp,
  whatsapp_numero = "5579996848609",
  desconto_percentual = 0,
  desconto_ativo = false,
  preco_original,
  data_desconto_inicio,
  data_desconto_fim,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleComprar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mensagem = mensagem_whatsapp || 
      `*Olá Maria!* Tenho interesse em adquirir o produto *${nome}*. Pode me informar mais detalhes sobre disponibilidade e forma de pagamento?`;
    const encodedMessage = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${whatsapp_numero}?text=${encodedMessage}`, "_blank");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  // Verificar se o desconto está válido (ativo e dentro do prazo)
  const isDescontoValido = () => {
    if (!desconto_ativo || !desconto_percentual || desconto_percentual <= 0) {
      return false;
    }
    
    const hoje = new Date();
    const inicio = data_desconto_inicio ? new Date(data_desconto_inicio) : null;
    const fim = data_desconto_fim ? new Date(data_desconto_fim) : null;
    
    // Se não tem datas, considera válido apenas pelo status ativo
    if (!inicio || !fim) {
      return desconto_ativo && desconto_percentual > 0;
    }
    
    return hoje >= inicio && hoje <= fim;
  };

  const temDescontoValido = isDescontoValido();
  const precoExibido = temDescontoValido && preco_original
    ? calculateDiscountedPrice(preco_original, desconto_percentual)
    : preco;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-[0.98] animate-fade-in h-full flex flex-col touch-manipulation relative">
      {/* Insígnia de Desconto - Apenas se for válido */}

{temDescontoValido && (
  <div className="absolute top-2 right-2 z-10">
    {/* Glow effect - opcional, remove se não quiser */}
    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-red-500/20 rounded-full blur-sm"></div>
    
    {/* Chip principal */}
    <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-full shadow-sm overflow-hidden group">
      {/* Background color accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-primary/10 opacity-80"></div>
      
      {/* Conteúdo do chip */}
      <div className="relative px-3 py-1.5 flex items-center gap-1.5">
        {/* Ícone de tag */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-primary rounded-full blur-xs opacity-60"></div>
          <Tag className="relative w-3 h-3 text-red-600" />
        </div>
        
        {/* Texto do desconto */}
        <div className="flex items-baseline gap-0.5">
          <span className="text-[10px] font-medium text-gray-600">-</span>
          <span className="text-sm font-bold bg-gradient-to-br from-red-600 to-red-700 bg-clip-text text-transparent">
            {Math.round(desconto_percentual)}%
          </span>
        </div>
      </div>
      
      {/* Efeito sutil de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </div>
)}
      {/* Imagem do Produto */}
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

      {/* Conteúdo do Card */}
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
          <div className="flex flex-col gap-1">
            {temDescontoValido && preco_original ? (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(preco_original)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-sm sm:text-base">
                    {formatPrice(precoExibido)}
                  </span>
                </div>
              </>
            ) : (
              <span className="font-bold text-primary text-sm sm:text-base">
                {formatPrice(preco)}
              </span>
            )}
          </div>
          
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