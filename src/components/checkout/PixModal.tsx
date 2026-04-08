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

  const pixCode = '00020126580014BR.GOV.BCB.PIX0136f1e95e04-48ee-43f2-84b3-9b5f4cb4ed015204000053039865802BR5925Dayane Maria Souza de Oli6009SAO PAULO621405101NUuu8jB0L63044642';
  
  // Fallback web caso o app não esteja instalado
  const webFallback = 'https://nubank.com.br/cobrar/81vxn/69d68313-6cdf-4af4-b5ed-4b1638d743fb';

  const formatPrice = (price: number | undefined) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price ?? 0);
  };

  // Função para tentar abrir deep link e detectar se funcionou
  const tryOpenDeepLink = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false); // App não está instalado ou não abriu
      }, 2500);

      // Tenta abrir o deep link
      window.location.href = url;

      // Se o app abrir, a página perde foco
      const onBlur = () => {
        clearTimeout(timeout);
        resolve(true);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
      };

      // Se a página continuar visível, provavelmente falhou
      const onFocus = () => {
        clearTimeout(timeout);
        resolve(false);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
      };

      window.addEventListener('blur', onBlur, { once: true });
      window.addEventListener('focus', onFocus, { once: true });
    });
  };

  // Função principal para abrir o app do Nubank
  const openNubankApp = async () => {
    try {
      // Primeiro copia o código PIX
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      
      // Detecta o dispositivo
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      
      let deepLink = '';
      
      if (isAndroid) {
        // Intent para Android (abre diretamente o app)
        deepLink = `intent://pix#Intent;scheme=nubank;package=com.nu.production;S.browser_fallback_url=${encodeURIComponent(webFallback)};end`;
      } else if (isIOS) {
        // Deep link para iOS
        deepLink = `nubank://pix/pay?code=${encodeURIComponent(pixCode)}`;
      } else {
        // Desktop: copia e mostra alerta
        setTimeout(() => {
          alert('✅ Código PIX copiado! Use o app do Nubank no seu celular para pagar.');
          setCopied(false);
        }, 300);
        return;
      }
      
      // Tenta abrir o deep link
      const opened = await tryOpenDeepLink(deepLink);
      
      if (!opened) {
        // Se não abrir, usa fallback web
        setTimeout(() => {
          window.location.href = webFallback;
        }, 500);
      }
      
      // Reseta o estado de copiado após 3 segundos
      setTimeout(() => setCopied(false), 3000);
      
    } catch (error) {
      console.error('Erro ao abrir app:', error);
      // Fallback: copia e abre o link web
      setTimeout(() => {
        window.location.href = webFallback;
      }, 500);
    }
  };

  // Copiar apenas o código PIX (sem abrir app)
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = pixCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

          {/* Botão principal — Abrir Nubank App */}
          <Button
            onClick={openNubankApp}
            className="w-full py-6 text-base font-semibold rounded-xl gap-2 shadow-lg bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            <Smartphone className="w-5 h-5" />
            {copied ? 'Código copiado! Abrindo Nubank...' : 'Abrir no App do Nubank'}
          </Button>
          <p className="text-xs text-center text-muted-foreground -mt-2">
            O código PIX será copiado automaticamente e o app será aberto
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

        {/* Instruções adicionais */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-1">
              📱 Como pagar:
            </p>
            <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>Clique no botão acima para abrir o app do Nubank</li>
              <li>O código PIX será copiado automaticamente</li>
              <li>No app, vá em "Pagar" → "PIX Copia e Cola"</li>
              <li>Cole o código e confirme o pagamento</li>
            </ol>
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