import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export function CheckoutForm({ amount, onSuccess, onError, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMessage('Sistema de pagamento não carregado. Tente novamente.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/sucesso`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(`Erro: ${error.message}`);
        onError(error.message);
      } else {
        // Simula sucesso para demonstração
        setTimeout(() => {
          setPaymentCompleted(true);
          onSuccess(`pi_${Date.now()}_test`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar pagamento');
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentCompleted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pagamento Confirmado!</h3>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-blue-800">Pagamento 100% Seguro</span>
          </div>
          <p className="text-sm text-blue-700">
            Seus dados são criptografados e processados pelo Stripe. Não armazenamos informações do cartão.
          </p>
        </div>
        
        <div className="space-y-3">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                  phone: 'auto',
                }
              }
            }}
          />
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Erro no pagamento</p>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <button 
          type="submit"
          disabled={isLoading || !stripe}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 touch-manipulation"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm sm:text-base">Processando pagamento...</span>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base">
                Confirmar pagamento de R$ {amount.toFixed(2)}
              </span>
            </>
          )}
        </button>
        
        <button 
          type="button"
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-sm touch-manipulation"
        >
          Cancelar compra
        </button>
      </div>
    </form>
  );
}