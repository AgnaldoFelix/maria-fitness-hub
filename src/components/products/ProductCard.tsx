import { useState } from "react";
import { ShoppingBag, Check, ShoppingCartIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/contexts/CheckoutContext";

interface ProductCardProps {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto_url: string;
  desconto_percentual?: number;
  desconto_ativo?: boolean;
  preco_original?: number;
}

export function ProductCard({
  id,
  nome,
  descricao,
  preco,
  foto_url,
  desconto_percentual = 0,
  desconto_ativo = false,
  preco_original,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, cart } = useCheckout();

  // Verifica se o produto já está no carrinho
  const isInCart = cart.some(item => item.id === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    addToCart({
      id,
      nome,
      preco: precoExibido,
      originalPreco: preco_original,
      descricao,
      foto_url
    });

    // Feedback visual
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
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

  const temDescontoValido = desconto_ativo && desconto_percentual > 0;
  const precoExibido = temDescontoValido && preco_original
    ? calculateDiscountedPrice(preco_original, desconto_percentual)
    : preco;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
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
        
        {/* Badge de desconto */}
        {temDescontoValido && preco_original && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{Math.round(desconto_percentual)}%
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <CardContent className="p-4 flex flex-col flex-grow">
        {/* Nome e descrição */}
        <div className="mb-3 flex-grow">
          <h3 className="font-semibold text-foreground line-clamp-1 text-base mb-1">
            {nome}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {descricao}
          </p>
        </div>
        
        {/* Preço e botão */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex flex-col">
            {temDescontoValido && preco_original && (
              <span className="text-xs text-muted-foreground line-through mb-0.5">
                {formatPrice(preco_original)}
              </span>
            )}
            <span className="font-bold text-primary text-lg">
              {formatPrice(precoExibido)}
            </span>
          </div>
          
          {/* Botão simplificado - apenas ícone */}
          <button
            onClick={handleAddToCart}
            className={`
              relative w-10 h-10 rounded-[12px] flex items-center justify-center
              ${isInCart || addedToCart 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue/90'
              }
              transition-all duration-200
            `}
            aria-label={`Adicionar ${nome} ao carrinho`}
          >
            {isInCart || addedToCart ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCartIcon className="w-5 h-5" />
            )}
            
            {/* Feedback visual de adicionado */}
            {addedToCart && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                ✓
              </div>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}