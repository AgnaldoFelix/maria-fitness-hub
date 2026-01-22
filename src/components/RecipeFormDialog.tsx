import { useState, useEffect, useCallback } from "react";
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
  DialogDescription,
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
import { Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const [characterCount, setCharacterCount] = useState({
    ingredientes: 0,
    modo_preparo: 0,
  });

  // Processar texto para manter quebras de linha
  const processTextWithLineBreaks = useCallback((text: string) => {
    return text
      .replace(/\r\n/g, '\n')  // Normalizar quebras de linha
      .replace(/\n{3,}/g, '\n\n') // Limitar múltiplas quebras de linha
      .trim();
  }, []);

  useEffect(() => {
    if (recipe) {
      const processedIngredientes = processTextWithLineBreaks(recipe.ingredientes);
      const processedModoPreparo = processTextWithLineBreaks(recipe.modo_preparo);
      
      setFormData({
        nome: recipe.nome,
        ingredientes: processedIngredientes,
        modo_preparo: processedModoPreparo,
        categoria: recipe.categoria,
        tempo: recipe.tempo,
        foto_url: recipe.foto_url || "",
        publicada: recipe.publicada,
      });
      
      setCharacterCount({
        ingredientes: processedIngredientes.length,
        modo_preparo: processedModoPreparo.length,
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
      setCharacterCount({ ingredientes: 0, modo_preparo: 0 });
    }
  }, [recipe, open, processTextWithLineBreaks]);

  const handleTextareaChange = (field: 'ingredientes' | 'modo_preparo', value: string) => {
    const processedValue = processTextWithLineBreaks(value);
    setFormData({ ...formData, [field]: processedValue });
    setCharacterCount({ ...characterCount, [field]: processedValue.length });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      toast({ 
        title: "Nome obrigatório", 
        description: "Digite o nome da receita",
        variant: "destructive" 
      });
      return;
    }

    if (!formData.ingredientes.trim()) {
      toast({ 
        title: "Ingredientes obrigatórios", 
        description: "Digite os ingredientes da receita",
        variant: "destructive" 
      });
      return;
    }

    if (!formData.modo_preparo.trim()) {
      toast({ 
        title: "Modo de preparo obrigatório", 
        description: "Digite o modo de preparo da receita",
        variant: "destructive" 
      });
      return;
    }

    try {
      if (recipe) {
        await updateMutation.mutateAsync({
          id: recipe.id,
          ...formData,
        });
        toast({ 
          title: "Receita atualizada! ✅",
          description: "Sua receita foi atualizada com sucesso."
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({ 
          title: "Receita criada! 🎉",
          description: "Sua receita foi criada com sucesso."
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: "Erro ao salvar", 
        description: "Não foi possível salvar a receita. Tente novamente.",
        variant: "destructive" 
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const formatExampleText = (title: string, example: string) => {
    return `Exemplo:\n${example.split('\n').map(line => `• ${line}`).join('\n')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 sm:rounded-lg">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading text-xl">
              {recipe ? "✏️ Editar Receita" : "➕ Nova Receita"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {recipe ? "Atualize os detalhes da sua receita" : "Preencha os detalhes da nova receita"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
          {/* Nome da Receita */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="nome" className="text-sm font-medium">Nome da Receita</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Panqueca Proteica de Banana"
              className="h-11 text-base"
              maxLength={100}
              required
            />
          </div>

          {/* Categoria e Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo" className="text-sm font-medium">Tempo de Preparo</Label>
              <Input
                id="tempo"
                value={formData.tempo}
                onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                placeholder="Ex: 30 minutos"
                className="h-11 text-base"
                required
              />
            </div>
          </div>

          {/* Ingredientes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="ingredientes" className="text-sm font-medium">Ingredientes</Label>
                <span className="text-destructive">*</span>
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  <div className="absolute left-6 top-0 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Digite cada ingrediente em uma nova linha
                  </div>
                </div>
              </div>
              <span className={`text-xs ${characterCount.ingredientes > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount.ingredientes}/1000
              </span>
            </div>
            <Textarea
              id="ingredientes"
              value={formData.ingredientes}
              onChange={(e) => handleTextareaChange('ingredientes', e.target.value)}
              placeholder={formatExampleText("Ingredientes", "2 ovos\n1 banana madura\n2 colheres de sopa de aveia\n1 colher de chá de canela")}
              rows={5}
              className="min-h-[120px] text-sm leading-relaxed resize-y"
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              Pressione Enter para cada novo ingrediente
            </p>
          </div>

          {/* Modo de Preparo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="modo_preparo" className="text-sm font-medium">Modo de Preparo</Label>
                <span className="text-destructive">*</span>
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  <div className="absolute left-6 top-0 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Digite cada passo em uma nova linha. Use frases curtas e claras.
                  </div>
                </div>
              </div>
              <span className={`text-xs ${characterCount.modo_preparo > 800 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount.modo_preparo}/1500
              </span>
            </div>
            <Textarea
              id="modo_preparo"
              value={formData.modo_preparo}
              onChange={(e) => handleTextareaChange('modo_preparo', e.target.value)}
              placeholder={formatExampleText("Modo de Preparo", "Amasse a banana em uma tigela\nMisture com os ovos batidos\nAdicione a aveia e a canela\nCozinhe em frigideira antiaderente")}
              rows={5}
              className="min-h-[120px] text-sm leading-relaxed resize-y whitespace-pre-wrap"
              maxLength={1500}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cada linha será um passo. Evite textos muito longos em uma única linha.
            </p>
          </div>

          {/* URL da Foto */}
          <div className="space-y-2">
            <Label htmlFor="foto_url" className="text-sm font-medium">URL da Foto (opcional)</Label>
            <div className="relative">
              <Input
                id="foto_url"
                value={formData.foto_url}
                onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                placeholder="https://exemplo.com/foto-da-panqueca.jpg"
                className="h-11 text-base pr-10"
                type="url"
              />
              {formData.foto_url && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Dica: Use links de imagens com boa qualidade (recomendado: 600x400px)
            </p>
          </div>

          {/* Status de Publicação */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="publicada" className="text-sm font-medium">Publicar receita</Label>
              <p className="text-xs text-muted-foreground">
                {formData.publicada 
                  ? "A receita estará visível para todos os usuários" 
                  : "A receita ficará oculta até ser publicada"}
              </p>
            </div>
            <Switch
              id="publicada"
              checked={formData.publicada}
              onCheckedChange={(checked) => setFormData({ ...formData, publicada: checked })}
              className="data-[state=checked]:bg-success"
            />
          </div>

          {/* Validações */}
          {(characterCount.ingredientes > 500 || characterCount.modo_preparo > 800) && (
            <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 text-sm">
                {characterCount.ingredientes > 500 && "Os ingredientes estão muito longos. Tente simplificar.\n"}
                {characterCount.modo_preparo > 800 && "O modo de preparo está muito longo. Divida em passos mais curtos."}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 text-base"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-11 text-base gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : recipe ? (
                "Salvar Alterações"
              ) : (
                "Criar Receita"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}