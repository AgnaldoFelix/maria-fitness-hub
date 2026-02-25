// components/cart/CartDrawer.tsx
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ShoppingCartIcon,
  MapPin,
  User,
  Phone,
  Mail,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useState, useEffect } from "react";

export function CartDrawer() {
  const {
    cart,
    total,
    subtotal, // Adicionado
    frete, // Adicionado
    isCartOpen,
    closeCart,
    updateCustomerInfo,
    openPixModal,
    removeFromCart,
    updateQuantity,
    customerInfo,
    isPixModalOpen,
  } = useCheckout();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    nome: "",
    endereco: "",
    telefone: "",
  });

  // Inicializar form com dados existentes
  useEffect(() => {
    if (customerInfo.nome) {
      setFormData(customerInfo);
    }
  }, [customerInfo]);

  if (!isCartOpen) return null;

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || isNaN(price)) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(0);
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const validateForm = () => {
    const newErrors = { nome: "", endereco: "", telefone: "" };
    let isValid = true;

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
      isValid = false;
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = "Endereço é obrigatório";
      isValid = false;
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updateCustomerInfo(formData);
      setShowAddressForm(false);
      // NÃO FECHA O DRAWER - apenas abre o modal PIX por cima
      openPixModal();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckout = () => {
    if (customerInfo.nome && customerInfo.endereco && customerInfo.telefone) {
      // Já tem endereço salvo: abre PIX direto sem fechar o drawer
      openPixModal();
    } else {
      // Mostra formulário de endereço
      setShowAddressForm(true);
    }
  };

  const handleBackToCart = () => {
    setShowAddressForm(false);
    setErrors({ nome: "", endereco: "", telefone: "" });
  };

  return (
    <>
      {/* Backdrop - fica mais escuro quando o modal PIX está aberto */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isPixModalOpen ? "opacity-75" : ""
        }`}
        onClick={!isPixModalOpen ? closeCart : undefined}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 flex flex-col animate-slide-in-right ${
          isPixModalOpen ? "pointer-events-none opacity-75" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {showAddressForm ? (
              <MapPin className="w-6 h-6 text-primary" />
            ) : (
              <ShoppingCartIcon className="w-6 h-6" />
            )}
            <h2 className="text-xl font-bold">
              {showAddressForm ? "Informações de Entrega" : "Carrinho"}
            </h2>
            {!showAddressForm && cart.length > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={showAddressForm ? handleBackToCart : closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isPixModalOpen}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {showAddressForm ? (
            // Formulário de Endereço
            <div className="p-4">
              {customerInfo.nome && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">
                        Endereço salvo:
                      </p>
                      <p className="text-sm text-green-700">
                        {customerInfo.nome}
                      </p>
                      <p className="text-sm text-green-600 truncate">
                        {customerInfo.endereco}
                      </p>
                      <button
                        onClick={() => {
                          setFormData({
                            nome: "",
                            endereco: "",
                            telefone: "",
                            email: "",
                          });
                        }}
                        className="text-xs text-green-600 hover:text-green-800 mt-1"
                        disabled={isPixModalOpen}
                      >
                        Usar outro endereço
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <User className="w-4 h-4" />
                    Nome Completo *
                  </label>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo"
                    className={errors.nome ? "border-red-500" : ""}
                    required
                    disabled={isPixModalOpen}
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Phone className="w-4 h-4" />
                    Telefone *
                  </label>
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone ? "border-red-500" : ""}
                    required
                    disabled={isPixModalOpen}
                  />
                  {errors.telefone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.telefone}
                    </p>
                  )}
                </div>

                {/* Email (opcional) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Mail className="w-4 h-4" />
                    E-mail (opcional)
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    disabled={isPixModalOpen}
                  />
                </div>

                {/* Endereço */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Endereço Completo *
                  </label>
                  <Textarea
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro, cidade, estado"
                    rows={3}
                    className={errors.endereco ? "border-red-500" : ""}
                    required
                    disabled={isPixModalOpen}
                  />
                  {errors.endereco && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endereco}
                    </p>
                  )}
                </div>

                {/* Botões do formulário */}
                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary/90"
                    disabled={cart.length === 0 || isPixModalOpen}
                  >
                    Continuar para Pagamento
                  </Button>

                  <Button
                    type="button"
                    onClick={handleBackToCart}
                    variant="outline"
                    className="w-full py-3"
                    disabled={isPixModalOpen}
                  >
                    Voltar para o Carrinho
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Suas informações serão usadas apenas para entrega
                  </p>
                </div>
              </form>
            </div>
          ) : (
            // Lista de Produtos do Carrinho
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Carrinho vazio
                    </h3>
                    <p className="text-gray-500">
                      Adicione produtos para ver eles aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 border rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={item.foto_url || "/placeholder.svg"}
                            alt={item.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {item.nome}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 ml-2"
                              disabled={isPixModalOpen}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-lg font-bold text-primary mt-1">
                            {formatPrice(item.preco)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantidade - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100"
                                disabled={isPixModalOpen}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantidade}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantidade + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100"
                                disabled={isPixModalOpen}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Subtotal</p>
                              <p className="font-bold">
                                {formatPrice(item.preco * item.quantidade)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer do Carrinho */}
              {cart.length > 0 && (
                <div className="border-t p-4 space-y-4">
<div className="space-y-3">
  {/* Subtotal */}
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-600">Subtotal</span>
    <span className="font-medium">
      {formatPrice(subtotal)}
    </span>
  </div>
  
  {/* Frete - sempre aparece quando há itens */}
  {cart.length > 0 && (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">Frete (fixo)</span>
      <span className="font-medium text-green-600">
        {formatPrice(frete)}
      </span>
    </div>
  )}
  
  {/* Divisor */}
  <div className="border-t border-dashed my-2"></div>
  
  {/* Total */}
  <div className="flex justify-between items-center">
    <span className="text-gray-800 font-medium">Total</span>
    <div className="text-right">
      <span className="text-2xl font-bold text-primary">
        {formatPrice(total)}
      </span>
      <span className="text-xs text-gray-500 block">
        (frete incluso)
      </span>
    </div>
  </div>

                    {/* Informações do cliente se já preenchidas */}
                    {customerInfo.nome && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Entrega para:</span>{" "}
                          {customerInfo.nome}
                        </p>
                        <p className="text-xs text-blue-600 truncate">
                          {customerInfo.endereco}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full py-3 text-lg bg-primary hover:bg-primary/90"
                    size="lg"
                    disabled={isPixModalOpen}
                  >
                    {customerInfo.nome
                      ? "Continuar para Pagamento"
                      : "Finalizar Compra"}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    {customerInfo.nome
                      ? "Endereço já cadastrado ✓"
                      : "Você preencherá o endereço na próxima etapa"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
