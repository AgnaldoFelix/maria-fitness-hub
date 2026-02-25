import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Download,
  QrCode,
  Clock,
  Copy,
  Check,
} from "lucide-react";

export default function Sucesso() {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const paymentId = searchParams.get("payment_id");
  const total = searchParams.get("total");
  const method = searchParams.get("method") || "pix"; 
  const customerName = searchParams.get("customer_name");
  const customerAddress = searchParams.get("customer_address");

  useEffect(() => {
    if (paymentId) {
      verifyPayment();
    }
  }, [paymentId]);

  const verifyPayment = async () => {
    setLoading(true);
    try {
      if (method === "pix") {
        // Para PIX, verifica status
        const response = await fetch(
          `http://mmfitness-backend.onrender.com/payments/pix/check/${paymentId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
      =================================
      COMPROVANTE DE PAGAMENTO - PIX
      =================================
      Data: ${new Date().toLocaleString("pt-BR")}
      TXID: ${paymentId || "N/A"}
      Método: PIX
      Valor: ${formatPrice(total || "0")}
      Status: PAGAMENTO CONFIRMADO
      Cliente: ${customerName || "Cliente"}
      Endereço: ${customerAddress || "Não informado"}
      =================================
      MARIA FITNESS - ALIMENTAÇÃO SAUDÁVEL
      =================================
      📞 Contato: (79) 99684-8609
      📍 Endereço: Aracaju/SE
      =================================
      OBRIGADO PELA SUA COMPRA!
      =================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprovante-pix-${paymentId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Código PIX mock para exemplo (substitua pelo real se tiver)
  const pixCode = "00020101021226860014br.gov.bcb.pix2565qrcode-pix.gerencianet.com.br/qr/v2/9d3616f2-8bc8-40b3-bf17-7c7e8e8c8e8c5204000053039865406100.005802BR5925Nubank Tecnologia e Ser6009Sao Paulo62070503***6304E2CA";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header com ícone de sucesso */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PIX Confirmado!
          </h1>
          <p className="text-gray-600">
            Seu pagamento via PIX foi processado com sucesso
          </p>
        </div>

        {/* Badge PIX */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <QrCode className="w-5 h-5" />
            <span className="text-sm font-bold">PAGAMENTO VIA PIX</span>
          </div>
        </div>

        {/* Valor pago */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Valor Pago</p>
            <p className="font-bold text-4xl text-green-700">
              {formatPrice(total || "0")}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Pagamento confirmado instantaneamente</span>
            </div>
          </div>
        </div>

        {/* Informações do cliente */}
        {(customerName || customerAddress) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-3">📦 Informações de Entrega</h3>
            <div className="space-y-2">
              {customerName && (
                <div className="flex items-start">
                  <span className="text-sm text-blue-600 w-20 flex-shrink-0">Cliente:</span>
                  <span className="font-medium text-blue-900">{customerName}</span>
                </div>
              )}
              {customerAddress && (
                <div className="flex items-start">
                  <span className="text-sm text-blue-600 w-20 flex-shrink-0">Endereço:</span>
                  <span className="text-sm text-blue-900">{customerAddress}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detalhes da transação PIX */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-3">📋 Detalhes da Transação</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                CONCLUÍDO
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Método</span>
              <span className="font-medium text-gray-800">PIX Instantâneo</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Data/Hora</span>
              <span className="text-sm text-gray-800">
                {new Date().toLocaleString("pt-BR")}
              </span>
            </div>

            {/* TXID */}
            {paymentId && (
              <div>
                <span className="text-sm text-gray-500 block mb-1">TXID da Transação</span>
                <div className="bg-white border rounded p-2 flex items-center justify-between">
                  <code className="font-mono text-xs truncate flex-1">
                    {paymentId.length > 20 ? `${paymentId.substring(0, 20)}...` : paymentId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(paymentId)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    title="Copiar TXID"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensagem informativa para PIX */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-1">Próximos Passos</h4>
              <p className="text-sm text-green-700">
                O comprovante do PIX foi enviado para o WhatsApp da loja. 
                A vendedora entrará em contato em breve para confirmar a entrega.
              </p>
            </div>
          </div>
        </div>

        {/* Comprovante PIX (opcional) */}
        {method === "pix" && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">🧾 Comprovante PIX</h3>
            <div className="space-y-2">
              <div className="bg-white border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Código PIX</span>
                  <button
                    onClick={() => copyToClipboard(pixCode)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                  {pixCode.substring(0, 50)}...
                </div>
              </div>
              <button
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar Comprovante
              </button>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Link to="/" className="flex-1">
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg">
                <ShoppingBag className="w-5 h-5" />
                Continuar Comprando
              </button>
            </Link>

            <Link to="/receitas" className="flex-1">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200">
                <Home className="w-5 h-5" />
                Início
              </button>
            </Link>
          </div>

          {/* Contato de suporte */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Precisa de ajuda?</p>
            <div className="flex items-center justify-center gap-2">
              <a
                href="https://wa.me/5579996848609"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                <span>📱</span>
                Falar com a Vendedora
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Número: (79) 99684-8609
            </p>
          </div>
        </div>
      </div>

      {/* Mensagem de carregamento */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Verificando status do PIX...</p>
          </div>
        </div>
      )}
    </div>
  );
}