import { Modal } from '@heroui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import { useCheckout } from '@/contexts/CheckoutContext';

const stripePromise = loadStripe('pk_live_51QsvOtCpyvWgpfWyznknSkWp6Nj0sHNr2AiUYBC26ubVBn9fCzPEjmTmnaxVtQRZGBohJHrKBPHm7Q1AaXIXMRr600DLmVDOXL');

export function CheckoutModal() {
  const { cart, total, isCheckoutOpen, closeCheckout, clearCart } = useCheckout();
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createPaymentIntent = async () => {
    if (!isCheckoutOpen || cart.length === 0) return;
    
    setIsLoading(true);
    setError('');
    setClientSecret('');
    
    try {
      // Tenta a rota principal primeiro
      let response = await fetch('http://localhost:8000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(total * 100), // Stripe usa centavos
          currency: 'brl',
          description: `Compra de ${cart.length} produtos`
        })
      });

      // Se falhar, tenta a rota alternativa
      if (!response.ok) {
        response = await fetch('http://localhost:8000/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: Math.round(total * 100),
            currency: 'brl',
            description: `Compra de ${cart.length} produtos`
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || 'Não foi possível criar o pagamento'}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.client_secret) {
        setClientSecret(data.client_secret);
      } else {
        throw new Error(data.detail || 'Resposta inválida do servidor');
      }
    } catch (err: any) {
      console.error('❌ Erro ao criar pagamento:', err);
      setError(err.message || 'Erro de conexão. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCheckoutOpen && !clientSecret && !error && cart.length > 0) {
      createPaymentIntent();
    }
  }, [isCheckoutOpen, cart]);

  const handleSuccess = async (paymentId: string) => {
    console.log('✅ Pagamento bem-sucedido:', paymentId);
    
    try {
      const verifyResponse = await fetch(`http://localhost:8000/api/verify-payment/${paymentId}`);
      if (verifyResponse.ok) {
        await verifyResponse.json();
      }
    } catch (err) {
      console.log('ℹ️ Não foi possível verificar o pagamento');
    }
    
    // Limpa o carrinho e fecha o modal
    clearCart();
    closeCheckout();
    
    // Redireciona para página de sucesso
    window.location.href = `/sucesso?payment_id=${paymentId}&total=${total}`;
  };

  const handleError = (message: string) => {
    console.error('❌ Erro no pagamento:', message);
    setError(message);
  };

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
      hideCloseButton={isLoading}
      backdrop="blur"
      classNames={{
        base: [
          "max-w-md mx-auto",
          "md:max-w-lg",
          "h-[90vh] md:h-auto",
          "max-h-[90vh] md:max-h-[85vh]",
          "my-auto md:my-4",
          "rounded-xl md:rounded-2xl",
          "border border-gray-200",
          "shadow-2xl"
        ].join(" "),
        wrapper: "z-[9999] px-2 md:px-0",
        body: "p-0"
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Finalizar Compra</h2>
              <p className="text-sm text-gray-600">{cart.length} itens</p>
            </div>
          </div>
          <button
            onClick={closeCheckout}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="overflow-y-auto h-[calc(90vh-80px)] px-6 pb-6">
        {/* Resumo */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-green-700">
              {formatPrice(total)}
            </span>
          </div>
        </div>
        
        {/* Erros */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
        
        {/* Loading ou Formulário */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Preparando pagamento...</p>
          </div>
        ) : clientSecret ? (
          <Elements 
            stripe={stripePromise} 
            options={{ clientSecret }}
          >
            <CheckoutForm 
              amount={total}
              onSuccess={handleSuccess}
              onError={handleError}
              onClose={closeCheckout}
            />
          </Elements>
        ) : null}
      </div>
    </Modal>
  );
}