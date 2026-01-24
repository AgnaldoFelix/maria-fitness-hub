import { Sparkles, ShoppingBag } from "lucide-react";
import { useCheckout } from "@/contexts/CheckoutContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Maria Fitness", subtitle }: HeaderProps) {
  const { cart, total, openCart } = useCheckout();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo e título centralizados */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img
              src="/day.png"
              alt="Maria Fitness"
              className="w-full h-full object-cover"
            />
          </div>
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
        </div>

        {/* Título central */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="font-heading font-bold text-lg text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Botão do carrinho */}
        <button
          onClick={openCart}
          className="relative p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="w-6 h-6" />
          
          {/* Badge com quantidade */}
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
          
          {/* Valor total (opcional - aparece no hover) */}
          <div className="hidden md:block absolute top-full right-0 mt-1 bg-background border shadow-lg rounded-lg px-3 py-2 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Total: {formatPrice(total)}
          </div>
        </button>
      </div>
    </header>
  );
}