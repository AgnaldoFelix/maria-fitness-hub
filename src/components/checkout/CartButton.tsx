import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/contexts/CheckoutContext';

interface CartButtonProps {
  onClick: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const { cart, total } = useCheckout();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (cart.length === 0) return null;

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="relative border-primary text-primary hover:bg-primary/10"
    >
      <ShoppingBag className="w-5 h-5 mr-2" />
      <span className="font-medium">
        {formatPrice(total)}
      </span>
      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
        {cart.length}
      </span>
    </Button>
  );
}