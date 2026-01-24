import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, Download } from 'lucide-react';

export default function Sucesso() {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (paymentId) {
      verifyPayment();
    }
  }, [paymentId]);

  const verifyPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/verify-payment/${paymentId}`);
      const data = await response.json();
      setPaymentData(data);
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compra Confirmada!</h1>
          <p className="text-gray-600">Seu pagamento foi processado com sucesso</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Valor</p>
                <p className="font-bold text-lg text-green-700">
                  {amount ? `R$ ${parseFloat(amount).toFixed(2)}` : 'R$ 0,00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">Confirmado</p>
              </div>
              {paymentId && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">ID da Transação</p>
                  <p className="font-mono text-xs truncate" title={paymentId}>
                    {paymentId.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Download className="w-4 h-4" />
              Baixar comprovante
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-center text-sm text-gray-500 mb-4">
            Você receberá um e-mail com os detalhes da sua compra em instantes.
          </p>
          
          <div className="flex gap-3">
            <Link to="/" className="flex-1">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Continuar Comprando
              </button>
            </Link>
            
            <Link to="/receitas" className="flex-1">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Página Inicial
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}