// contexts/CheckoutContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Adicione a constante do frete
const FRETE_FIXO = 6;

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

  // Calcular subtotal (soma dos produtos)
  const subtotal = cart.reduce((acc, item) => {
    const preco = Number(item.preco) || 0;
    const quantidade = Number(item.quantidade) || 0;
    return acc + (preco * quantidade);
  }, 0);
  
  // FRETE FIXO - sempre R$ 6,00 quando há itens no carrinho
  // Independente do endereço!
  const frete = cart.length > 0 ? FRETE_FIXO : 0;
  
  // Total final (subtotal + frete)
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

    // Abre o carrinho automaticamente ao adicionar
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
      prev.map(item => 
        item.id === id 
          ? { ...item, quantidade: quantity } 
          : item
      )
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
    ).join('\n')}\n\n📦 Subtotal: R$ ${subtotal.toFixed(2)}\n🚚 Frete: R$ ${frete.toFixed(2)} (fixo)\n💰 Total: R$ ${total.toFixed(2)}\n💳 Método: PIX\n\n🚚 Entregar em: ${customerInfo.endereco}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5579996848609'; // Número da dona do app
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Limpar carrinho e fechar modais
    clearCart();
    closePixModal();
    closeCheckout();
    closeAddressModal();
    closeCart();
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