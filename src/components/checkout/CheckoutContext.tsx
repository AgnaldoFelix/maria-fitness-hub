import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const total = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
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
      prev.map(item => item.id === id ? { ...item, quantidade: quantity } : item)
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

  const updateCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  const confirmPayment = async () => {
    // Enviar mensagem para WhatsApp
    const message = `✅ NOVA COMPRA CONFIRMADA ✅\n\n👤 Cliente: ${customerInfo.nome}\n📍 Endereço: ${customerInfo.endereco}\n📞 Telefone: ${customerInfo.telefone || 'Não informado'}\n\n🛒 Itens Comprados:\n${cart.map(item => 
      `• ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2)}`
    ).join('\n')}\n\n💰 Total: R$ ${total.toFixed(2)}\n💳 Método: PIX\n\n🚚 Entregar em: ${customerInfo.endereco}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5579996848609'; // Número da dona do app
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Limpar carrinho e fechar modais
    clearCart();
    closePixModal();
    closeCheckout();
    closeAddressModal();
  };

  return (
    <CheckoutContext.Provider
      value={{
        cart,
        total,
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
        confirmPayment
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}