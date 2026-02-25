import React, { createContext, useContext, useState, ReactNode } from 'react';

const FRETE_FIXO = 5;

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  foto_url: string;
  descricao: string;
}

interface CustomerInfo {
  nome: string;
  endereco: string;
  telefone?: string;
  email?: string;
}

interface CheckoutContextType {
  cart: CartItem[];
  total: number;
  subtotal: number;
  frete: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAddressModalOpen: boolean;
  customerInfo: CustomerInfo;
  paymentMethod: 'stripe' | 'pix' | null;
  isPixModalOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  clearCart: () => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  updateCustomerInfo: (info: CustomerInfo) => void;
  setPaymentMethod: (method: 'stripe' | 'pix' | null) => void;
  openPixModal: () => void;
  closePixModal: () => void;
  confirmPayment: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    nome: '',
    endereco: '',
    telefone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'pix' | null>(null);

  // Cálculos
  const subtotal = cart.reduce((acc, item) => {
    const preco = Number(item.preco) || 0;
    const quantidade = Number(item.quantidade) || 0;
    return acc + preco * quantidade;
  }, 0);

  const frete = cart.length > 0 ? FRETE_FIXO : 0;
  const total = subtotal + frete;

  const addToCart = (item: CartItem) => {
    const itemComPrecoValido = {
      ...item,
      preco: Number(item.preco) || 0,
      quantidade: Number(item.quantidade) || 1
    };
    setCart(prev => {
      const existingItem = prev.find(i => i.id === itemComPrecoValido.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === itemComPrecoValido.id
            ? { ...i, quantidade: (i.quantidade || 0) + 1 }
            : i
        );
      }
      return [...prev, { ...itemComPrecoValido, quantidade: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === id ? { ...item, quantidade: quantity } : item))
    );
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);
  const clearCart = () => setCart([]);
  const openAddressModal = () => setIsAddressModalOpen(true);
  const closeAddressModal = () => setIsAddressModalOpen(false);
  const openPixModal = () => setIsPixModalOpen(true);
  const closePixModal = () => setIsPixModalOpen(false);
  const updateCustomerInfo = (info: CustomerInfo) => setCustomerInfo(info);

  const sendWhatsAppNotification = async () => {
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const messageLines = [
        '✅ NOVA COMPRA CONFIRMADA ✅',
        '',
        `👤 Cliente: ${customerInfo.nome}`,
        `📍 Endereço: ${customerInfo.endereco}`,
        `📞 Telefone: ${customerInfo.telefone || 'Não informado'}`,
        '',
        '🛒 Itens Comprados:',
        ...cart.map(
          item =>
            `• ${item.nome} (${item.quantidade}x) - R$ ${(
              item.preco * item.quantidade
            ).toFixed(2)}`
        ),
        '',
        `💰 Total: R$ ${total.toFixed(2)}`,
        `💳 Método: PIX`,
        '',
        `📋 ID do Pedido: ${orderId}`,
        `🚚 Entregar em: ${customerInfo.endereco}`,
        '',
        '⚠️ Por favor, confirme o recebimento e prepare a entrega!'
      ];

      const message = messageLines.join('\n');
      const encodedMessage = encodeURIComponent(message).replace(/%0A/g, '%0D%0A');
      const vendorPhone = '5579996848609';
      const whatsappLink = `https://api.whatsapp.com/send?phone=${vendorPhone}&text=${encodedMessage}`;

      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      const simpleMessage = `Nova compra confirmada - Cliente: ${customerInfo.nome} - Total: R$ ${total.toFixed(2)}`;
      const encodedFallback = encodeURIComponent(simpleMessage);
      const fallbackLink = `https://wa.me/5579996848609?text=${encodedFallback}`;
      window.open(fallbackLink, '_blank');
    }
  };

  const confirmPayment = async () => {
    try {
      await sendWhatsAppNotification();
      clearCart();
      closePixModal();
      closeCheckout();
      closeAddressModal();
      closeCart();
      // Se quiser redirecionar para uma página de sucesso, pode adicionar:
      // window.location.href = `/sucesso?total=${total}&payment_method=pix`;
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('O pagamento foi confirmado, mas houve um erro ao enviar a notificação.');
    }
  };

  // Log para debug
  console.log('🛒 Cart Items:', cart.length);
  console.log('💰 subtotal:', subtotal);
  console.log('🚚 frete:', frete);
  console.log('💵 total:', total);

  return (
    <CheckoutContext.Provider
      value={{
        cart,
        total,
        subtotal,
        frete,
        isCartOpen,
        isCheckoutOpen,
        isAddressModalOpen,
        customerInfo,
        paymentMethod,
        isPixModalOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        clearCart,
        openAddressModal,
        closeAddressModal,
        updateCustomerInfo,
        setPaymentMethod,
        openPixModal,
        closePixModal,
        confirmPayment,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within a CheckoutProvider');
  return context;
}