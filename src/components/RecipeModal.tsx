import { X, Copy, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Recipe } from "@/hooks/useRecipes";

interface RecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function RecipeModal({ recipe, open, onClose }: RecipeModalProps) {
  const { toast } = useToast();

  if (!recipe) return null;

  const formatForCanva = () => {
    const emojiMap: Record<string, string> = {
      "Café da Manhã": "☀️",
      "Lanche": "🥪",
      "Doce Fit": "🍫",
      "Low Carb": "🥗",
      "Proteico": "💪",
      "Jantar": "🍽️",
      "Almoço": "🍲",
    };

    const emoji = emojiMap[recipe.categoria] || "🥗";

    return `${emoji} ${recipe.nome.toUpperCase()} ${emoji}

📋 **Ingredientes:**
${recipe.ingredientes
  .split("\n")
  .map((line) => `• ${line.trim()}`)
  .join("\n")}

👩‍🍳 **Modo de Preparo:**
${recipe.modo_preparo
  .split("\n")
  .map((line, i) => `${i + 1}. ${line.trim()}`)
  .join("\n")}

⏱️ Tempo de preparo: ${recipe.tempo}

✨ Receita por @mariafitness`;
  };

  const handleCopyForCanva = async () => {
    const formattedText = formatForCanva();
    await navigator.clipboard.writeText(formattedText);
    toast({
      title: "Copiado! ✨",
      description: "Receita formatada copiada para a área de transferência.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <img
            src={recipe.foto_url || "/placeholder.svg"}
            alt={recipe.nome}
            className="w-full aspect-video object-cover"
          />
          <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
            {recipe.categoria}
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-heading text-2xl text-foreground">
              {recipe.nome}
            </DialogTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{recipe.tempo}</span>
            </div>
          </DialogHeader>

          <Button
            onClick={handleCopyForCanva}
            variant="outline"
            className="w-full gap-2 border-primary text-primary hover:bg-accent"
          >
            <Sparkles className="w-4 h-4" />
            ✨ Usar no Canva
          </Button>

          <div className="space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-2">
                📋 Ingredientes
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                {recipe.ingredientes.split("\n").map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{item.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-foreground mb-2">
                👩‍🍳 Modo de Preparo
              </h4>
              <ol className="space-y-2 text-muted-foreground">
                {recipe.modo_preparo.split("\n").map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step.trim()}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
