import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Shield, QrCode, CreditCard, Percent, ChevronDown, ExternalLink } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  onSuccess: (paymentId: string, paymentMethod?: string, installmentData?: any) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export function CheckoutForm({ amount, onSuccess, onError, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  
  // Estados para PIX com EfiPay
  const [pixData, setPixData] = useState<{
    txid: string;
    qr_code: string;
    copy_paste: string;
    expires_at: string;
    provider: string;
  } | null>(null);
  const [pixExpiresAt, setPixExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Estados para parcelamento
  const [installmentOptions, setInstallmentOptions] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [installmentAmount, setInstallmentAmount] = useState<number>(amount);
  const [hasInterest, setHasInterest] = useState<boolean>(false);
  const [totalWithInterest, setTotalWithInterest] = useState<number>(amount);
  const [showInstallmentDropdown, setShowInstallmentDropdown] = useState(false);

  // Contador regressivo para PIX
  useEffect(() => {
    if (!pixExpiresAt || paymentMethod !== 'pix') return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = pixExpiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft('Expirado');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [pixExpiresAt, paymentMethod]);

  // Calcular opções de parcelamento (máximo 5x)
  const calculateInstallments = () => {
    const options = [];
    const maxInstallments = 5;
    
    for (let i = 1; i <= maxInstallments; i++) {
      let installmentValue = amount / i;
      let hasInterest = false;
      let totalValue = amount;
      
      // Aplica juros a partir da 3ª parcela
      if (i >= 3) {
        const interestRate = 0.0199; // 1.99% ao mês
        totalValue = amount * Math.pow(1 + interestRate, i);
        installmentValue = totalValue / i;
        hasInterest = true;
      }
      
      options.push({
        installments: i,
        installmentValue,
        totalValue,
        hasInterest,
        interestRate: hasInterest ? '1.99% a.m.' : 'sem juros',
        label: i === 1 
          ? `À vista - ${formatCurrency(amount)}` 
          : `${i}x de ${formatCurrency(installmentValue)} ${hasInterest ? '(com juros)' : '(sem juros)'}`
      });
    }
    
    return options;
  };

  // Inicializar opções de parcelamento
  useEffect(() => {
    if (paymentMethod === 'card') {
      const options = calculateInstallments();
      setInstallmentOptions(options);
      
      if (options.length > 0) {
        setSelectedInstallment(options[0].installments);
        setInstallmentAmount(options[0].installmentValue);
        setTotalWithInterest(options[0].totalValue);
        setHasInterest(options[0].hasInterest);
      }
    }
  }, [amount, paymentMethod]);

  // Atualizar valores quando muda o parcelamento
  const handleInstallmentChange = (installments: number) => {
    setSelectedInstallment(installments);
    const option = installmentOptions.find(opt => opt.installments === installments);
    if (option) {
      setInstallmentAmount(option.installmentValue);
      setTotalWithInterest(option.totalValue);
      setHasInterest(option.hasInterest);
    }
    setShowInstallmentDropdown(false);
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Criar pagamento PIX com EfiPay
  const createPixPayment = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://https://mmfitness-backend.onrender.com/create-pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100), // Envia em centavos
          description: 'Pagamento via PIX'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar pagamento PIX');
      }

      const data = await response.json();
      
      if (data.success && data.qr_code && data.copy_paste) {
        setPixData(data);
        setPixExpiresAt(new Date(data.expires_at));
        console.log('✅ PIX gerado via EfiPay:', data.txid);
      } else {
        throw new Error('Resposta inválida do servidor PIX');
      }
    } catch (err: any) {
      setErrorMessage(`Erro PIX: ${err.message}`);
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Processar pagamento com cartão (Stripe)
  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setErrorMessage('Sistema de pagamento não carregado. Tente novamente.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Cria payment intent com parcelamento
      const response = await fetch('http://https://mmfitness-backend.onrender.com/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: totalWithInterest,
          description: `Compra ${selectedInstallment > 1 ? `parcelada em ${selectedInstallment}x` : 'à vista'}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar pagamento');
      }

      const data = await response.json();
      
      if (data.client_secret) {
        // Confirma o pagamento com Stripe Elements
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret: data.client_secret,
          confirmParams: {
            return_url: `${window.location.origin}/sucesso`,
          },
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(`Erro: ${error.message}`);
          onError(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          setPaymentCompleted(true);
          onSuccess(paymentIntent.id, 'card', {
            installments: selectedInstallment,
            installmentValue: installmentAmount,
            totalWithInterest,
            hasInterest
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar pagamento');
      onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status do PIX com EfiPay
  const checkPixStatus = async (txid: string) => {
    try {
      const response = await fetch(`http://https://mmfitness-backend.onrender.com/check-pix-status/${txid}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status PIX:', data.status);
        
        if (data.status === 'CONCLUIDA' || data.status === 'ATIVA') {
          setPaymentCompleted(true);
          onSuccess(txid, 'pix');
          return true;
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status PIX:', err);
    }
    return false;
  };

  // Quando o usuário seleciona PIX
  useEffect(() => {
    if (paymentMethod === 'pix' && !pixData) {
      createPixPayment();
    }
  }, [paymentMethod]);

  // Polling para verificar status do PIX (a cada 5 segundos)
  useEffect(() => {
    if (paymentMethod === 'pix' && pixData && !paymentCompleted) {
      const interval = setInterval(async () => {
        const completed = await checkPixStatus(pixData.txid);
        if (completed) {
          clearInterval(interval);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [paymentMethod, pixData, paymentCompleted]);

  // Verificar status manualmente (botão)
  const handleCheckPixStatus = async () => {
    if (pixData) {
      const completed = await checkPixStatus(pixData.txid);
      if (!completed) {
        alert('Pagamento ainda não confirmado. Aguarde ou tente novamente em alguns instantes.');
      }
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
    <div className="space-y-6">
      {/* Seletor de método de pagamento */}
      <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            paymentMethod === 'card'
              ? 'bg-white shadow-sm text-primary font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Cartão</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('pix')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            paymentMethod === 'pix'
              ? 'bg-white shadow-sm text-primary font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            <span>PIX</span>
          </div>
        </button>
      </div>

      {/* Mensagem de segurança */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="font-medium text-blue-800">Pagamento 100% Seguro</span>
        </div>
        <p className="text-sm text-blue-700">
          {paymentMethod === 'card'
            ? 'Seus dados são criptografados e processados pelo Stripe. Não armazenamos informações do cartão.'
            : 'Pagamento instantâneo via PIX via EfiPay. QR Code válido por 30 minutos.'}
        </p>
      </div>

      {/* Formulário de cartão com parcelamento */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleCardPayment} className="space-y-4">
          {/* Seletor de parcelamento - Dropdown */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4" />
                Parcelamento
              </div>
            </label>
            
            {/* Dropdown de parcelamento */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInstallmentDropdown(!showInstallmentDropdown)}
                className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-md font-medium">
                    {selectedInstallment}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">
                      {selectedInstallment === 1 
                        ? 'À vista' 
                        : `${selectedInstallment}x de ${formatCurrency(installmentAmount)}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedInstallment === 1 
                        ? formatCurrency(amount)
                        : `Total: ${formatCurrency(totalWithInterest)} ${hasInterest ? '(com juros)' : '(sem juros)'}`}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showInstallmentDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showInstallmentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {installmentOptions.map((option) => (
                    <button
                      key={option.installments}
                      type="button"
                      onClick={() => handleInstallmentChange(option.installments)}
                      className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedInstallment === option.installments
                          ? 'bg-primary/5 text-primary'
                          : 'text-gray-700'
                      } ${option.hasInterest ? 'border-t border-gray-100 first:border-t-0' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-md font-medium ${
                          selectedInstallment === option.installments
                            ? 'bg-primary text-white'
                            : option.hasInterest
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {option.installments}
                        </div>
                        <div>
                          <div className="font-medium">
                            {option.installments === 1 ? 'À vista' : `${option.installments}x`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {option.installments === 1
                              ? formatCurrency(option.totalValue)
                              : `${formatCurrency(option.installmentValue)} cada`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          option.hasInterest ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {option.hasInterest ? 'Com juros' : 'Sem juros'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.installments > 1 && formatCurrency(option.totalValue)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Resumo do parcelamento */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 space-y-2 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor original:</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
              
              {selectedInstallment > 1 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Parcelas:</span>
                    <span className="font-medium">{selectedInstallment}x</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor da parcela:</span>
                    <span className="font-medium">{formatCurrency(installmentAmount)}</span>
                  </div>
                  
                  {hasInterest && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Juros ({selectedInstallment}x):</span>
                      <span className="font-medium text-yellow-600">
                        {formatCurrency(totalWithInterest - amount)}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-800">Total a pagar:</span>
                <span className={`text-xl font-bold ${
                  hasInterest ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {formatCurrency(totalWithInterest)}
                </span>
              </div>
              
              {selectedInstallment > 1 && (
                <div className="text-center text-xs text-gray-500 pt-1">
                  {selectedInstallment}x de {formatCurrency(installmentAmount)}
                </div>
              )}
            </div>
          </div>

          {/* Formulário do cartão */}
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
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 text-white py-4 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation shadow-md hover:shadow-lg disabled:hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm sm:text-base">Processando pagamento...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm sm:text-base">
                    {selectedInstallment === 1 ? 'Pagar à vista' : `Pagar parcelado (${selectedInstallment}x)`}
                  </span>
                </>
              )}
            </button>
            
            <div className="text-center text-xs text-gray-500">
              {selectedInstallment === 1 ? (
                <p>Pagamento à vista • {formatCurrency(amount)}</p>
              ) : (
                <p>
                  {selectedInstallment}x de {formatCurrency(installmentAmount)} • 
                  Total: {formatCurrency(totalWithInterest)} • 
                  {hasInterest ? ' Com juros' : ' Sem juros'}
                </p>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Pagamento PIX com EfiPay */}
      {paymentMethod === 'pix' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Gerando QR Code PIX via EfiPay...</p>
            </div>
          ) : pixData ? (
            <>
              <div className="bg-white border rounded-xl p-6 text-center">
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <QrCode className="w-10 h-10 text-green-600" />
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Pague com PIX</h3>
                  <p className="text-gray-600 text-sm">
                    Escaneie o QR Code ou copie o código
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Via EfiPay
                    </span>
                  </div>
                </div>

                {/* QR Code - EfiPay retorna base64 PNG */}
                <div className="bg-white p-4 rounded-lg border mb-4">
                  {pixData.qr_code.startsWith('data:image') ? (
                    <img 
                      src={pixData.qr_code} 
                      alt="QR Code PIX" 
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center rounded">
                      <p className="text-gray-500 text-sm">QR Code gerado via EfiPay</p>
                    </div>
                  )}
                </div>

                {/* Código PIX Copy & Paste */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Código PIX (copie e cole):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={pixData.copy_paste}
                      className="w-full p-3 bg-gray-50 border rounded-lg font-mono text-sm pr-10"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.copy_paste);
                        alert('Código copiado! Cole no seu app de pagamentos.');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Timer e botão de verificação */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span>QR Code válido por:</span>
                    <span className="font-bold text-red-600">{timeLeft}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCheckPixStatus}
                    className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Verificar pagamento
                  </button>
                  
                  <div className="text-xs text-gray-500">
                    TXID: <span className="font-mono">{pixData.txid.substring(0, 12)}...</span>
                  </div>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Como pagar:</h4>
                <ol className="space-y-1 text-sm text-gray-600">
                  <li>1. Abra seu app do banco ou carteira digital</li>
                  <li>2. Acesse a função PIX Copia e Cola</li>
                  <li>3. Cole o código acima ou escaneie o QR Code</li>
                  <li>4. Confira os dados e confirme o pagamento</li>
                  <li>5. O status será atualizado automaticamente</li>
                </ol>
                <div className="pt-2 mt-2 border-t">
                  <p className="text-xs text-gray-500">
                    <strong>Dica:</strong> Após pagar, clique em "Verificar pagamento" para atualizar o status.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Clique em PIX para gerar o código de pagamento.</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Erro no pagamento PIX</p>
                  <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botão de cancelar */}
      <button 
        type="button"
        onClick={onClose}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-sm touch-manipulation"
        disabled={isLoading}
      >
        {isLoading ? 'Processando...' : 'Cancelar compra'}
      </button>
    </div>
  );
}