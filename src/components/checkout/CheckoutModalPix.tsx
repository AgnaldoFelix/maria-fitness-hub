// Versão simplificada do CheckoutModal (apenas PIX)
import { Modal } from '@heroui/react';
import { X, ShoppingBag, QrCode } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';

export function CheckoutModal() {
  const { 
    cart, 
    total, 
    isCheckoutOpen, 
    closeCheckout, 
    customerInfo,
    openPixModal
  } = useCheckout();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (cart.length === 0) return null;

  return (
    <Modal 
      isOpen={isCheckoutOpen} 
      onClose={closeCheckout}
      backdrop="blur"
      classNames={{
        base: "max-w-md mx-auto rounded-2xl border border-gray-200 shadow-2xl",
        wrapper: "z-[9999] px-4",
        body: "p-0"
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Finalizar Compra</h2>
              <p className="text-sm text-gray-600">
                {cart.length} itens • {customerInfo.nome || 'Cliente'}
              </p>
            </div>
          </div>
          <button onClick={closeCheckout} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Cliente e Endereço */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="font-medium text-blue-800 mb-1">📦 Entrega para:</p>
          <p className="text-blue-700 font-medium">{customerInfo.nome}</p>
          <p className="text-sm text-blue-600">{customerInfo.endereco}</p>
          {customerInfo.telefone && (
            <p className="text-xs text-blue-500 mt-1">📞 {customerInfo.telefone}</p>
          )}
        </div>

        {/* Resumo do Total */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total da Compra</span>
            <span className="text-2xl font-bold text-green-700">
              {formatPrice(total)}
            </span>
          </div>
        </div>
        
        {/* Apenas opção PIX */}
        <div className="space-y-4">
          <div 
            className="border-2 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors bg-green-50 border-green-200"
            onClick={() => {
              closeCheckout();
              openPixModal();
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Pagar com PIX</p>
                <p className="text-sm text-gray-600">Pagamento instantâneo com 5% OFF</p>
              </div>
              <div className="text-right">
                <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                  5% OFF
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={closeCheckout}
            className="w-full py-3 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}