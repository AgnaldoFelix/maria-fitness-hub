import { useCheckout } from '@/contexts/CheckoutContext';
import { X, Copy, Check, QrCode, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function PixModal() {
  const { 
    isPixModalOpen, 
    closePixModal, 
    confirmPayment,
    total,
    subtotal, // Adicione isso se tiver no contexto
    frete,    // Adicione isso se tiver no contexto
    customerInfo,
    cart
  } = useCheckout();

  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Link do PIX do Nubank
  const pixLink = 'https://nubank.com.br/cobrar/81vxn/69d68313-6cdf-4af4-b5ed-4b1638d743fb';
  const pixCode = '00020126580014BR.GOV.BCB.PIX0136f1e95e04-48ee-43f2-84b3-9b5f4cb4ed015204000053039865802BR5925Dayane Maria Souza de Oli6009SAO PAULO621405101NUuu8jB0L63044642';

  console.log('🎯 PixModal renderizado, isOpen:', isPixModalOpen);

const formatPrice = (price: number | undefined) => {
  if (price === undefined || isNaN(price)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(0);
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setPaymentConfirmed(true);
    await confirmPayment();
  };

  if (!isPixModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={closePixModal}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto z-10 shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Pagamento via PIX</h2>
            <p className="text-sm text-gray-600">Escaneie o QR Code ou copie o código</p>
          </div>
          <button
            onClick={closePixModal}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Valor */}
        <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Valor a pagar</p>
          <p className="text-3xl font-bold text-primary">{formatPrice(total)}</p>
        </div>

        {/* QR Code */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <QrCode className="w-16 h-16 text-primary mb-4" />
            
            {/* QR Code Image */}
            <img 
              src={'/QRDayane.jpg'}
              alt="QR Code PIX"
              className="w-44 h-44 mb-6 rounded-lg border"
              onError={(e) => {
                // Fallback se a imagem não carregar
                e.currentTarget.style.display = 'none';
              }}
            />
            
            <p className="text-center text-sm text-gray-600 mb-4">
              Escaneie o código acima com o aplicativo do seu banco
            </p>
            
            <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>O QR Code expira em 30 minutos</span>
            </div>
          </div>
        </div>

        {/* Código PIX */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Ou copie o código PIX:
          </label>
          <div className="relative">
            <div className="bg-gray-50 border rounded-lg p-3 pr-10 break-all text-sm font-mono">
              {pixCode}
            </div>
            <button
              onClick={() => copyToClipboard(pixCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Link direto para pagamento */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Pagar via link do Nubank:
          </label>
          <Button
            onClick={() => window.open(pixLink, '_blank')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Abrir no Nubank para pagar
          </Button>
        </div>

        {/* Resumo do pedido */}
        <div className="border-t pt-4 mb-6">
          <h3 className="font-medium mb-2">Resumo do Pedido:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{customerInfo.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Endereço:</span>
              <span className="text-right max-w-[200px] truncate">{customerInfo.endereco}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone:</span>
              <span className="font-medium">{customerInfo.telefone || 'Não informado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Itens:</span>
              <span>{cart.length} produto{cart.length !== 1 ? 's' : ''}</span>
            </div>
            
            {/* Detalhamento do valor */}
            {subtotal !== undefined && frete !== undefined && (
              <>
                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete:</span>
                  <span className="text-green-600">{formatPrice(frete)}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total:</span>
              <span className="text-green-700">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Botão de confirmação */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirmPayment}
            className="w-full py-3"
            disabled={paymentConfirmed}
          >
            {paymentConfirmed ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Pagamento Confirmado!
              </>
            ) : (
              'Já efetuei o pagamento'
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Após confirmar o pagamento, uma mensagem será enviada automaticamente para a vendedora via WhatsApp
          </p>
          
          <Button
            onClick={closePixModal}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}