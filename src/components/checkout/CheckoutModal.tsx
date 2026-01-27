import { Modal } from '@heroui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { X, ShoppingBag, CreditCard, QrCode } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import { useCheckout } from '@/contexts/CheckoutContext';

const stripePromise = loadStripe('pk_live_51QsvOtCpyvWgpfWyznknSkWp6Nj0sHNr2AiUYBC26ubVBn9fCzPEjmTmnaxVtQRZGBohJHrKBPHm7Q1AaXIXMRr600DLmVDOXL');
const API_URL = import.meta.env.VITE_API_URL;
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

export function CheckoutModal() {
  const { 
    cart, 
    total, 
    isCheckoutOpen, 
    closeCheckout, 
    clearCart,
    customerInfo,
    paymentMethod,
    setPaymentMethod,
    openPixModal,
    confirmPayment
  } = useCheckout();
  
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createPaymentIntent = async () => {
    if (!isCheckoutOpen || cart.length === 0) return;
    
    setIsLoading(true);
    setError('');
    setClientSecret('');
    
    try {
      let response = await fetch(`${baseUrl}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(total * 100),
          currency: 'brl',
          description: `Compra de ${cart.length} produtos`
        })
      });

      if (!response.ok) {
        response = await fetch(`${baseUrl}/create-payment-intent`, {
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
    if (isCheckoutOpen && !clientSecret && !error && cart.length > 0 && paymentMethod === 'stripe') {
      createPaymentIntent();
    }
  }, [isCheckoutOpen, cart, paymentMethod]);

  const handleSuccess = async (paymentId: string) => {
    console.log('✅ Pagamento bem-sucedido:', paymentId);
    
    try {
      // Verificar pagamento com Stripe
      const verifyResponse = await fetch(`${baseUrl}/verify-payment/${paymentId}`);
      if (verifyResponse.ok) {
        await verifyResponse.json();
      }
    } catch (err) {
      console.log('ℹ️ Não foi possível verificar o pagamento');
    }
    
    // Enviar notificação WhatsApp
    await confirmPayment('stripe');
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
    <>
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
                <h2 className="text-xl font-bold mt-2">Finalizar Compra</h2>
                <p className="text-sm text-gray-600">
                  {cart.length} itens • {customerInfo.nome || 'Cliente'}
                </p>
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
          {/* Resumo do Cliente e Endereço */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-medium text-blue-800 mb-1">📦 Entrega para:</p>
                <p className="text-blue-700 font-medium">{customerInfo.nome}</p>
                <p className="text-sm text-blue-600">{customerInfo.endereco}</p>
                {customerInfo.telefone && (
                  <p className="text-xs text-blue-500 mt-1">📞 {customerInfo.telefone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Resumo do Total */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total da Compra</span>
              <span className="text-2xl font-bold text-green-700">
                {formatPrice(total)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {cart.length} produto{cart.length !== 1 ? 's' : ''} no carrinho
            </div>
          </div>
          
          {/* Escolha do método de pagamento - SEMPRE MOSTRA */}
          {!paymentMethod && (
            <div className="space-y-2 pb-[70px]">
              <h3 className="font-bold text-lg">Escolha a forma de pagamento:</h3>
              
              {/* Opção PIX */}
              <div 
                className="border-2 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  setPaymentMethod('pix');
                  openPixModal();
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">PIX</p>
                      <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                      5% OFF
                    </p>
                  </div>
                </div>
              </div>

              {/* Opção Cartão */}
              <div 
                className="border-2 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setPaymentMethod('stripe')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Cartão de Crédito</p>
                    <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Se escolheu Stripe, mostra o formulário */}
          {paymentMethod === 'stripe' && (
            <>
              {/* Erros */}
              {error && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>
              )}
              
              {/* Loading ou Formulário Stripe */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Preparando pagamento...</p>
                </div>
              ) : clientSecret ? (
                <div className="mt-6">
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
                </div>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}