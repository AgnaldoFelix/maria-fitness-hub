import { useCheckout } from '@/contexts/CheckoutContext';
import { X, Copy, Check, Clock, Smartphone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function PixModal() {
  const { 
    isPixModalOpen, 
    closePixModal, 
    confirmPayment,
    total,
    subtotal,
    frete,
    customerInfo,
    cart
  } = useCheckout();

  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const pixLink = 'https://nubank.com.br/cobrar/81vxn/69d68313-6cdf-4af4-b5ed-4b1638d743fb';
  const pixCode = '00020126580014BR.GOV.BCB.PIX0136f1e95e04-48ee-43f2-84b3-9b5f4cb4ed015204000053039865802BR5925Dayane Maria Souza de Oli6009SAO PAULO621405101NUuu8jB0L63044642';

  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price ?? 0);
  };

  const copyAndOpenNubank = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = pixCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    // Use location.href to trigger universal link / deep link on mobile
    // This opens the Nubank app directly if installed
    setTimeout(() => {
      window.location.href = pixLink;
    }, 400);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = pixCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setPaymentConfirmed(true);
    await confirmPayment();
  };

  if (!isPixModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closePixModal}
      />
      
      {/* Modal — slides up on mobile */}
      <div className="relative bg-background rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md sm:mx-4 max-h-[92vh] overflow-y-auto z-10 shadow-2xl border border-border animate-in slide-in-from-bottom duration-300">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="p-5 pb-8 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Pagamento PIX</h2>
                <p className="text-xs text-muted-foreground">Pague instantaneamente</p>
              </div>
            </div>
            <button
              onClick={closePixModal}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Valor */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Valor total</p>
            <p className="text-3xl font-extrabold text-primary tracking-tight">
              {formatPrice(total)}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Válido por 30 minutos</span>
            </div>
          </div>

          {/* Botão principal — Abrir Nubank */}
          <Button
            onClick={copyAndOpenNubank}
            className="w-full py-6 text-base font-semibold rounded-xl gap-2 shadow-lg"
            size="lg"
          >
            <Smartphone className="w-5 h-5" />
            {copied ? 'Código copiado! Abrindo...' : 'Abrir no Nubank para pagar'}
          </Button>
          <p className="text-xs text-center text-muted-foreground -mt-2">
            O código PIX será copiado automaticamente
          </p>

          {/* Código PIX manual */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Ou copie o código manualmente:
            </label>
            <div 
              onClick={copyToClipboard}
              className="relative bg-muted/50 border border-border rounded-xl p-3 pr-12 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <p className="text-xs font-mono text-foreground/80 break-all line-clamp-2">
                {pixCode}
              </p>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Resumo compacto */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium text-foreground">{customerInfo.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Itens</span>
              <span className="text-foreground">{cart.length} produto{cart.length !== 1 ? 's' : ''}</span>
            </div>
            {subtotal !== undefined && frete !== undefined && (
              <>
                <div className="border-t border-border my-1" />
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span>{formatPrice(frete)}</span>
                </div>
              </>
            )}
            <div className="border-t border-border my-1" />
            <div className="flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Confirmar pagamento */}
          <div className="space-y-3 pt-1">
            <Button
              onClick={handleConfirmPayment}
              variant="outline"
              className="w-full py-5 rounded-xl font-semibold"
              disabled={paymentConfirmed}
            >
              {paymentConfirmed ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Pagamento confirmado!
                </>
              ) : (
                'Já fiz o pagamento ✓'
              )}
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground leading-tight">
              Ao confirmar, uma mensagem será enviada para a vendedora via WhatsApp com os detalhes do pedido
            </p>
            
            <button
              onClick={closePixModal}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
