import { Modal } from '@heroui/react';
import { X, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';

export function AddressModal() {
  const { 
    isAddressModalOpen, 
    closeAddressModal, 
    updateCustomerInfo,
    openCheckout,
    cart 
  } = useCheckout();

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: ''
  });

  const [errors, setErrors] = useState({
    nome: '',
    endereco: '',
    telefone: ''
  });

  const validateForm = () => {
    const newErrors = { nome: '', endereco: '', telefone: '' };
    let isValid = true;

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
      isValid = false;
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateCustomerInfo(formData);
      closeAddressModal();
      openCheckout();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando usuário começar a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isAddressModalOpen}
      onClose={closeAddressModal}
      hideCloseButton={false}
      backdrop="blur"
      classNames={{
        base: [
          "max-w-md mx-auto",
          "rounded-2xl",
          "border border-gray-200",
          "shadow-2xl"
        ].join(" "),
        wrapper: "z-[9999] px-4",
        body: "p-0"
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Informações de Entrega</h2>
          </div>
          <button
            onClick={closeAddressModal}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              className={errors.nome ? 'border-red-500' : ''}
              required
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
              className={errors.telefone ? 'border-red-500' : ''}
              required
            />
            {errors.telefone && (
              <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
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
              className={errors.endereco ? 'border-red-500' : ''}
              required
            />
            {errors.endereco && (
              <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>
            )}
          </div>

          {/* Botão de continuar */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full py-3"
              disabled={cart.length === 0}
            >
              Continuar para Pagamento
            </Button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Suas informações serão usadas apenas para entrega
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
}