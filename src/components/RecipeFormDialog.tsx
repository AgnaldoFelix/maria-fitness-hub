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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateRecipe, useUpdateRecipe, type Recipe } from "@/hooks/useRecipes";
import { Loader2 } from "lucide-react";

const categories = ["Café da Manhã", "Lanche", "Doce Fit", "Low Carb", "Proteico", "Almoço", "Jantar"];

interface RecipeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
}

export function RecipeFormDialog({ open, onOpenChange, recipe }: RecipeFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();

  const [formData, setFormData] = useState({
    nome: "",
    ingredientes: "",
    modo_preparo: "",
    categoria: "Lanche",
    tempo: "30 min",
    foto_url: "",
    publicada: false,
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        nome: recipe.nome,
        ingredientes: recipe.ingredientes,
        modo_preparo: recipe.modo_preparo,
        categoria: recipe.categoria,
        tempo: recipe.tempo,
        foto_url: recipe.foto_url || "",
        publicada: recipe.publicada,
      });
    } else {
      setFormData({
        nome: "",
        ingredientes: "",
        modo_preparo: "",
        categoria: "Lanche",
        tempo: "30 min",
        foto_url: "",
        publicada: false,
      });
    }
  }, [recipe, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (recipe) {
        await updateMutation.mutateAsync({
          id: recipe.id,
          ...formData,
        });
        toast({ title: "Receita atualizada com sucesso!" });
      } else {
        await createMutation.mutateAsync(formData);
        toast({ title: "Receita criada com sucesso!" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro ao salvar receita", variant: "destructive" });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {recipe ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Receita</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Panqueca Proteica"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo">Tempo de Preparo</Label>
              <Input
                id="tempo"
                value={formData.tempo}
                onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                placeholder="Ex: 30 min"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredientes">Ingredientes (um por linha)</Label>
            <Textarea
              id="ingredientes"
              value={formData.ingredientes}
              onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
              placeholder="2 ovos&#10;1 banana madura&#10;2 colheres de aveia"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modo_preparo">Modo de Preparo (um passo por linha)</Label>
            <Textarea
              id="modo_preparo"
              value={formData.modo_preparo}
              onChange={(e) => setFormData({ ...formData, modo_preparo: e.target.value })}
              placeholder="Amasse a banana&#10;Misture os ingredientes&#10;Cozinhe na frigideira"
              rows={5}
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

          <div className="flex items-center justify-between">
            <Label htmlFor="publicada">Publicar receita</Label>
            <Switch
              id="publicada"
              checked={formData.publicada}
              onCheckedChange={(checked) => setFormData({ ...formData, publicada: checked })}
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {recipe ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
