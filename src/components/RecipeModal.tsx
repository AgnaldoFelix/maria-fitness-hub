import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Clock, Utensils, ChefHat, Copy, MessageCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { type Recipe } from "@/hooks/useRecipes";

interface RecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function RecipeModal({ recipe, open, onClose }: RecipeModalProps) {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const whatsappNumero = settings?.whatsapp_numero || "5511999999999";

  if (!recipe) return null;

  // Função para quebrar texto longo automaticamente
  const autoBreakText = (text: string, maxLineLength = 60) => {
    if (!text) return "";
    
    // Dividir por quebras de linha existentes
    const lines = text.split('\n');
    
    // Processar cada linha
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return "";
      
      // Se a linha já tem bullets ou números, manter o prefixo
      const hasBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');
      const hasNumber = /^\d+[\.\)]/.test(trimmedLine);
      
      let prefix = "";
      let content = trimmedLine;
      
      if (hasBullet) {
        prefix = trimmedLine.charAt(0) + " ";
        content = trimmedLine.slice(1).trim();
      } else if (hasNumber) {
        const match = trimmedLine.match(/^(\d+[\.\)]\s*)/);
        if (match) {
          prefix = match[0];
          content = trimmedLine.slice(match[0].length).trim();
        }
      }
      
      // Se a linha já é curta o suficiente, retornar como está
      if (content.length <= maxLineLength) {
        return prefix + content;
      }
      
      // Quebrar a linha em palavras
      const words = content.split(' ');
      const resultLines: string[] = [];
      let currentLine = prefix;
      
      words.forEach(word => {
        // Se adicionando a palavra ultrapassa o limite e já temos algo na linha
        if (currentLine.length + word.length + 1 > maxLineLength && currentLine !== prefix) {
          resultLines.push(currentLine);
          currentLine = " ".repeat(prefix.length) + word; // Indentar as linhas subsequentes
        } else {
          // Adicionar espaço se não for o primeiro item da linha
          if (currentLine !== prefix && currentLine !== " ".repeat(prefix.length)) {
            currentLine += " ";
          }
          currentLine += word;
        }
      });
      
      // Adicionar a última linha
      if (currentLine) {
        resultLines.push(currentLine);
      }
      
      return resultLines.join('\n');
    });
    
    return processedLines.join('\n');
  };

  // Formatar ingredientes mantendo bullets
  const formatIngredients = (ingredients: string) => {
    const lines = ingredients.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return trimmed;
      }
      return `• ${trimmed}`;
    }).join('\n');
  };

  // Formatar modo de preparo com numeração e quebras automáticas
  const formatPreparation = (preparation: string) => {
    const steps = preparation.split('\n').filter(step => step.trim());
    
    // Adicionar numeração se não existir
    const numberedSteps = steps.map((step, index) => {
      const trimmed = step.trim();
      // Se já começa com número, manter
      if (/^\d+[\.\)]/.test(trimmed)) {
        return trimmed;
      }
      return `${index + 1}. ${trimmed}`;
    });
    
    // Aplicar quebras automáticas a cada passo
    return numberedSteps.map(step => autoBreakText(step, 60)).join('\n\n');
  };

  // Função para renderizar modo de preparo com quebras visuais
  const renderPreparationSteps = (preparation: string) => {
    const formatted = formatPreparation(preparation);
    const steps = formatted.split('\n\n');
    
    return steps.map((step, index) => {
      // Extrair número do passo se existir
      const stepNumberMatch = step.match(/^(\d+[\.\)])/);
      const stepNumber = stepNumberMatch ? stepNumberMatch[1] : `${index + 1}.`;
      const stepContent = stepNumberMatch ? step.slice(stepNumberMatch[0].length).trim() : step;
      
      return (
        <div key={index} className="bg-gradient-to-r from-background to-muted/20 rounded-lg p-4 border border-muted/50">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
              {stepNumber}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                {autoBreakText(stepContent, 55)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleShareWhatsApp = () => {
    const ingredientsFormatted = formatIngredients(recipe.ingredientes);
    const preparationFormatted = formatPreparation(recipe.modo_preparo);
    
    const message = `🍽️ *${recipe.nome}*\n\n📋 *Ingredientes:*\n${ingredientsFormatted}\n\n👩‍🍳 *Modo de Preparo:*\n${preparationFormatted}\n\n⏱️ *Tempo:* ${recipe.tempo}\n\n✨ Receita por Maria Fitness`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleCopyRecipe = async () => {
    const ingredientsFormatted = formatIngredients(recipe.ingredientes);
    const preparationFormatted = formatPreparation(recipe.modo_preparo);
    
    const recipeText = `🍽️ ${recipe.nome}\n\n📋 Ingredientes:\n${ingredientsFormatted}\n\n👩‍🍳 Modo de Preparo:\n${preparationFormatted}\n\n⏱️ Tempo: ${recipe.tempo}\n\n✨ Receita por Maria Fitness`;
    
    try {
      await navigator.clipboard.writeText(recipeText);
      toast({
        title: "Receita copiada! 📋",
        description: "A receita foi copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a receita.",
        variant: "destructive",
      });
    }
  };

  const handleContact = () => {
    const message = `Olá Maria! Tenho uma dúvida sobre a receita "${recipe.nome}". Poderia me ajudar?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumero}?text=${encodedMessage}`, '_blank');
  };

  // Emoji para categoria
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      "Café da Manhã": "☀️",
      "Lanche": "🥪",
      "Doce Fit": "🍫",
      "Low Carb": "🥗",
      "Proteico": "💪",
      "Almoço": "🍽️",
      "Jantar": "🌙",
    };
    return emojiMap[category] || "🍽️";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 sm:rounded-lg">
        {/* Header com botão de fechar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading text-lg truncate">
              {recipe.nome}
            </DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto">
          {/* Imagem da receita */}
          {recipe.foto_url && (
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted to-muted/50">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <img
                src={recipe.foto_url}
                alt={recipe.nome}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                loading="lazy"
              />
            </div>
          )}

          <div className="p-5 space-y-6">
            {/* Meta informações */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                <span className="text-base">{getCategoryEmoji(recipe.categoria)}</span>
                <span>{recipe.categoria}</span>
              </Badge>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm bg-muted/50 rounded-full py-1.5 px-3">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{recipe.tempo}</span>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Ingredientes</h3>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 border border-muted/50">
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words font-medium">
                  {autoBreakText(formatIngredients(recipe.ingredientes), 60)}
                </div>
              </div>
            </div>

            {/* Modo de Preparo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Modo de Preparo</h3>
              </div>
              <div className="space-y-3">
                {renderPreparationSteps(recipe.modo_preparo)}
              </div>
            </div>

            {/* Dicas e Observações */}
            {recipe.observacoes && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">💡</span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg">Dicas</h3>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200/50">
                  <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap break-words">
                    {autoBreakText(recipe.observacoes, 60)}
                  </p>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="sticky bottom-0 bg-background pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="gap-2 h-11 border-2"
                  onClick={handleCopyRecipe}
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button
                  className="gap-2 h-11 bg-gradient-to-r from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90 text-white border-0 shadow-md"
                  onClick={handleShareWhatsApp}
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
              </div>
              
              <Button
                variant="outline"
                className="w-full gap-2 mt-3 h-11 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                onClick={handleContact}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Tirar dúvida sobre esta receita</span>
              </Button>
              
              <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
                  <img 
                    src="/day.png" 
                    alt="Maria Fitness" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receita criada por <span className="font-medium text-primary">Maria Fitness</span> ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}