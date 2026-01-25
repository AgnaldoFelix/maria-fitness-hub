import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Download,
  CreditCard,
  QrCode,
} from "lucide-react";

export default function Sucesso() {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const paymentId = searchParams.get("payment_id");
  const total = searchParams.get("total");
  const method = searchParams.get("method") || "card";
  const items = searchParams.get("items");

  useEffect(() => {
    if (paymentId) {
      verifyPayment();
    }
  }, [paymentId]);

  const verifyPayment = async () => {
    setLoading(true);
    try {
      // Verifica se é pagamento PIX (EfiPay) ou Cartão (Stripe)
      if (method === "pix") {
        // Para PIX, usa check-pix-status
        const response = await fetch(
          `http://https://mmfitness-backend.onrender.com/check-pix-status/${paymentId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);

          // Se o status for CONCLUIDA, marca como pago
          if (data.status === "CONCLUIDA") {
            setPaymentStatus("CONFIRMADO");
          }
        }
      } else {
        // Para cartão, usa verify-payment
        const response = await fetch(
          `http://https://mmfitness-backend.onrender.com/verify-payment/${paymentId}`,
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

  // Decodificar itens se existirem
  const decodedItems = items ? decodeURIComponent(items) : "";

  const handleDownloadReceipt = () => {
    // Criar um comprovante simples para download
    const receiptContent = `
      =================================
      COMPROVANTE DE PAGAMENTO
      =================================
      Data: ${new Date().toLocaleString("pt-BR")}
      ID: ${paymentId || "N/A"}
      Método: ${method === "pix" ? "PIX" : "Cartão de Crédito"}
      Valor: ${formatPrice(total || "0")}
      Status: CONFIRMADO
      ${decodedItems ? `Itens: ${decodedItems}` : ""}
      =================================
      Maria Fitness - Pagamento via Stripe
      =================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprovante-${paymentId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compra Confirmada!
          </h1>
          <p className="text-gray-600">
            Seu pagamento foi processado com sucesso
          </p>
        </div>

        {/* Badge do método de pagamento */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${method === "pix" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
          >
            {method === "pix" ? (
              <>
                <QrCode className="w-4 h-4" />
                <span className="text-sm font-medium">PIX</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">CARTÃO</span>
              </>
            )}
          </div>
        </div>

        {/* Resumo da compra */}
        <div className="space-y-4 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                <p className="font-bold text-3xl text-green-700">
                  {formatPrice(total || "0")}
                </p>
              </div>

              {decodedItems && (
                <div className="mt-3 pt-3 border-t border-green-100">
                  <p className="text-sm text-gray-500 mb-2">Itens comprados:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {decodedItems}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detalhes da transação */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                CONFIRMADO
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Método</span>
              <span className="font-medium">
                {method === "pix" ? "PIX" : "Cartão"}
              </span>
            </div>

            {paymentId && (
              <div>
                <span className="text-sm text-gray-500 block mb-1">
                  {method === "pix" ? "TXID da Transação" : "ID da Transação"}
                </span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate flex-1">
                    {paymentId.length > 24
                      ? `${paymentId.substring(0, 24)}...`
                      : paymentId}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentId);
                      alert("Copiado!");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botão de download */}
          <div className="text-center">
            <button
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Baixar comprovante
            </button>
          </div>
        </div>

        {/* Mensagem informativa */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 text-center">
            {method === "pix"
              ? "O comprovante do PIX foi enviado para seu e-mail cadastrado no banco."
              : "A fatura do cartão aparecerá na próxima cobrança do seu cartão."}
          </p>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Link to="/" className="flex-1">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200">
                <ShoppingBag className="w-5 h-5" />
                Continuar Comprando
              </button>
            </Link>

            <Link to="/receitas" className="flex-1">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200">
                <Home className="w-5 h-5" />
                Página Inicial
              </button>
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Em caso de dúvidas, entre em contato com nosso suporte
          </p>
        </div>
      </div>
    </div>
  );
}
