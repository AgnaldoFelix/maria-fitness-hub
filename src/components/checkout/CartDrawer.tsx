import { X, Plus, Minus, Trash2, ShoppingBag, Car, ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/contexts/CheckoutContext';


export function CartDrawer() {
  const { cart, total, isCartOpen, closeCart, openCheckout, removeFromCart, updateQuantity } = useCheckout();

  

  if (!isCartOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCheckout = () => {
    closeCart();
    if (cart.length > 0) {
      openCheckout();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={closeCart}
      />

      {/* Cart Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Carrinho</h2>
            {cart.length > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Carrinho vazio</h3>
              <p className="text-gray-500">Adicione produtos para ver eles aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-3 border rounded-lg">
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                    <img
                      src={item.foto_url || '/placeholder.svg'}
                      alt={item.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm line-clamp-2">{item.nome}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(item.preco)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantidade}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-bold">
                          {formatPrice(item.preco * item.quantidade)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full py-3 text-lg"
              size="lg"
            >
              Finalizar Compra
            </Button>

            <p className="text-xs text-center text-gray-500">
              Pagamento 100% seguro via Stripe
            </p>
          </div>
        )}
      </div>
    </>
  );
}