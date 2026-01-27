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
import { Loader2, AlertCircle, HelpCircle, Plus, Trash2, GripVertical } from "lucide-react";
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
    ingredientes: [] as string[], // Agora é um array
    modo_preparo: [] as string[], // Agora é um array
    categoria: "Lanche",
    tempo: "30 min",
    foto_url: "",
    publicada: false,
  });

  const [characterCount, setCharacterCount] = useState({
    ingredientes: 0,
    modo_preparo: 0,
  });

  // Converter string para array ao carregar receita existente
  useEffect(() => {
    if (recipe) {
      // Converter ingredientes de string para array
      const ingredientesArray = recipe.ingredientes
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[•\-]\s*/, '').trim());
      
      // Converter modo de preparo de string para array
      const modoPreparoArray = recipe.modo_preparo
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());
      
      setFormData({
        nome: recipe.nome,
        ingredientes: ingredientesArray,
        modo_preparo: modoPreparoArray,
        categoria: recipe.categoria,
        tempo: recipe.tempo,
        foto_url: recipe.foto_url || "",
        publicada: recipe.publicada,
      });
      
      setCharacterCount({
        ingredientes: recipe.ingredientes.length,
        modo_preparo: recipe.modo_preparo.length,
      });
    } else {
      setFormData({
        nome: "",
        ingredientes: [""], // Começa com um campo vazio
        modo_preparo: [""], // Começa com um campo vazio
        categoria: "Lanche",
        tempo: "30 min",
        foto_url: "",
        publicada: false,
      });
      setCharacterCount({ ingredientes: 0, modo_preparo: 0 });
    }
  }, [recipe, open]);

  // Atualizar contagem de caracteres
  useEffect(() => {
    const ingredientesText = formData.ingredientes.join('\n');
    const modoPreparoText = formData.modo_preparo.join('\n');
    
    setCharacterCount({
      ingredientes: ingredientesText.length,
      modo_preparo: modoPreparoText.length,
    });
  }, [formData.ingredientes, formData.modo_preparo]);

  // Adicionar novo ingrediente
  const addIngrediente = () => {
    setFormData({
      ...formData,
      ingredientes: [...formData.ingredientes, ""]
    });
  };

  // Remover ingrediente
  const removeIngrediente = (index: number) => {
    const newIngredientes = formData.ingredientes.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredientes: newIngredientes });
  };

  // Atualizar ingrediente
  const updateIngrediente = (index: number, value: string) => {
    const newIngredientes = [...formData.ingredientes];
    newIngredientes[index] = value;
    setFormData({ ...formData, ingredientes: newIngredientes });
  };

  // Adicionar novo passo
  const addPasso = () => {
    setFormData({
      ...formData,
      modo_preparo: [...formData.modo_preparo, ""]
    });
  };

  // Remover passo
  const removePasso = (index: number) => {
    const newModoPreparo = formData.modo_preparo.filter((_, i) => i !== index);
    setFormData({ ...formData, modo_preparo: newModoPreparo });
  };

  // Atualizar passo
  const updatePasso = (index: number, value: string) => {
    const newModoPreparo = [...formData.modo_preparo];
    newModoPreparo[index] = value;
    setFormData({ ...formData, modo_preparo: newModoPreparo });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filtrar ingredientes e passos vazios
    const ingredientesFiltrados = formData.ingredientes.filter(item => item.trim());
    const modoPreparoFiltrados = formData.modo_preparo.filter(item => item.trim());

    // Validações
    if (!formData.nome.trim()) {
      toast({ 
        title: "Nome obrigatório", 
        description: "Digite o nome da receita",
        variant: "destructive" 
      });
      return;
    }

    if (ingredientesFiltrados.length === 0) {
      toast({ 
        title: "Ingredientes obrigatórios", 
        description: "Digite pelo menos um ingrediente",
        variant: "destructive" 
      });
      return;
    }

    if (modoPreparoFiltrados.length === 0) {
      toast({ 
        title: "Modo de preparo obrigatório", 
        description: "Digite pelo menos um passo",
        variant: "destructive" 
      });
      return;
    }

    try {
      // Converter arrays para string para salvar no banco
      const recipeToSave = {
        ...formData,
        ingredientes: ingredientesFiltrados.map(item => `• ${item.trim()}`).join('\n'),
        modo_preparo: modoPreparoFiltrados.map((item, index) => `${index + 1}. ${item.trim()}`).join('\n'),
      };

      if (recipe) {
        await updateMutation.mutateAsync({
          id: recipe.id,
          ...recipeToSave,
        });
        toast({ 
          title: "Receita atualizada! ✅",
          description: "Sua receita foi atualizada com sucesso."
        });
      } else {
        await createMutation.mutateAsync(recipeToSave);
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
                    Adicione cada ingrediente separadamente. Comece com quantidades, ex: "2 ovos"
                  </div>
                </div>
              </div>
              <span className={`text-xs ${characterCount.ingredientes > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount.ingredientes}/1000
              </span>
            </div>
            
            <div className="space-y-3">
              {formData.ingredientes.map((ingrediente, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-shrink-0 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <Input
                    value={ingrediente}
                    onChange={(e) => updateIngrediente(index, e.target.value)}
                    placeholder={`Ingrediente ${index + 1} (ex: 2 ovos)`}
                    className="flex-1 h-11"
                    maxLength={200}
                  />
                  {formData.ingredientes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngrediente(index)}
                      className="h-11 w-11 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addIngrediente}
                className="w-full h-11 gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Ingrediente
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Cada ingrediente será automaticamente formatado com um bullet (•)
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
                    Descreva cada passo do preparo. Cada linha será um passo numerado.
                  </div>
                </div>
              </div>
              <span className={`text-xs ${characterCount.modo_preparo > 800 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount.modo_preparo}/1500
              </span>
            </div>
            
            <div className="space-y-3">
              {formData.modo_preparo.map((passo, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Passo {index + 1}
                    </Label>
                    {formData.modo_preparo.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePasso(index)}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={passo}
                    onChange={(e) => updatePasso(index, e.target.value)}
                    placeholder={`Descreva o passo ${index + 1} (ex: Bata os ovos em uma tigela)`}
                    rows={2}
                    className="min-h-[60px] text-sm resize-y"
                    maxLength={300}
                  />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addPasso}
                className="w-full h-11 gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Passo
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Cada passo será automaticamente numerado (1., 2., 3., ...)
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