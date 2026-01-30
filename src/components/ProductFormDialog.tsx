import { useState, useEffect, useRef } from "react";
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
import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from "@/hooks/useProducts";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Loader2, Camera, X, Image as ImageIcon } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    foto_url: "",
    disponivel: true,
    mensagem_whatsapp: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      setImagePreview(product.foto_url || "");
    } else {
      setFormData({
        nome: "",
        descricao: "",
        preco: "",
        foto_url: "",
        disponivel: true,
        mensagem_whatsapp: "",
      });
      setImagePreview("");
      setSelectedImage(null);
    }
  }, [product, open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF.");
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    setSelectedImage(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(selectedImage);
      setFormData({ ...formData, foto_url: imageUrl });
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData({ ...formData, foto_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se tem imagem selecionada mas não foi enviada, enviar primeiro
    if (selectedImage && !formData.foto_url) {
      await handleUploadImage();
      // Aguardar um pouco para o estado atualizar
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

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

  const isLoading =
    createMutation.isPending || updateMutation.isPending || uploadingImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload de Imagem */}
          <div className="space-y-3">
            <Label>Foto do Produto</Label>

            {/* Preview da Imagem */}
            <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhuma imagem selecionada
                  </p>
                </div>
              )}
            </div>

            {/* Botões de Upload */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="w-4 h-4" />
                Escolher Imagem
              </Button>

              {selectedImage && !formData.foto_url && (
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={handleUploadImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Enviar Imagem
                    </>
                  )}
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Tipos suportados: JPG, PNG, WebP, GIF. Tamanho máximo: 5MB.
            </p>
          </div>

          {/* Campos do Formulário */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: Marmita Fit Frango"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Descreva o produto..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco}
              onChange={(e) =>
                setFormData({ ...formData, preco: e.target.value })
              }
              placeholder="29.90"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem_whatsapp">
              Mensagem WhatsApp (opcional)
            </Label>
            <Textarea
              id="mensagem_whatsapp"
              value={formData.mensagem_whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, mensagem_whatsapp: e.target.value })
              }
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
              onCheckedChange={(checked) =>
                setFormData({ ...formData, disponivel: checked })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-success hover:bg-success/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : product ? (
                "Salvar Produto"
              ) : (
                "Criar Produto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
