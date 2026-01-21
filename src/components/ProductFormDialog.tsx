import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateProduct, useUpdateProduct, type Product } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    foto_url: "",
    disponivel: true,
    mensagem_whatsapp: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome,
        descricao: product.descricao,
        preco: String(product.preco),
        foto_url: product.foto_url || "",
        disponivel: product.disponivel,
        mensagem_whatsapp: product.mensagem_whatsapp || "",
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        preco: "",
        foto_url: "",
        disponivel: true,
        mensagem_whatsapp: "",
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco),
      foto_url: formData.foto_url || null,
      disponivel: formData.disponivel,
      mensagem_whatsapp: formData.mensagem_whatsapp || null,
    };

    try {
      if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          ...payload,
        });
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Produto criado com sucesso!" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro ao salvar produto", variant: "destructive" });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Marmita Fit Frango"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o produto..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              placeholder="29.90"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto_url">URL da Foto</Label>
            <Input
              id="foto_url"
              value={formData.foto_url}
              onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
              placeholder="https://exemplo.com/foto.jpg"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem_whatsapp">Mensagem WhatsApp (opcional)</Label>
            <Textarea
              id="mensagem_whatsapp"
              value={formData.mensagem_whatsapp}
              onChange={(e) => setFormData({ ...formData, mensagem_whatsapp: e.target.value })}
              placeholder="Mensagem personalizada para este produto..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar a mensagem padrão.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="disponivel">Produto disponível</Label>
            <Switch
              id="disponivel"
              checked={formData.disponivel}
              onCheckedChange={(checked) => setFormData({ ...formData, disponivel: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-success hover:bg-success/90" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
