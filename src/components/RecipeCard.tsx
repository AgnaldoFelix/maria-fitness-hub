// components/RecipeCard.tsx (versão ajustada)
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  id: string;
  nome: string;
  categoria: string;
  tempo: string;
  foto_url: string;
  onClick: () => void;
  className?: string;
}

export function RecipeCard({
  nome,
  categoria,
  tempo,
  foto_url,
  onClick,
  className,
}: RecipeCardProps) {
  const emojiMap: Record<string, string> = {
    "Café da Manhã": "☀️",
    "Lanche": "🥪",
    "Doce Fit": "🍫",
    "Low Carb": "🥗",
    "Proteico": "💪",
  };

  const emoji = emojiMap[categoria] || "🍽️";

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        "flex flex-col h-full", // Flexbox para preencher altura
        className
      )}
      onClick={onClick}
    >
      {/* Imagem com aspect-ratio quadrado */}
      <div className="relative pt-[75%] bg-muted overflow-hidden">
        {foto_url ? (
          <img
            src={foto_url}
            alt={nome}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
            <span className="text-4xl">{emoji}</span>
          </div>
        )}
      </div>

      <CardContent className="p-2 flex-1 flex flex-col">
        {/* Nome da receita */}
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] mb-2">
          {nome}
        </h3>

        {/* Categoria e Tempo na parte inferior */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-0.5 h-5 flex items-center gap-1"
            >
              <span className="text-xs">{emoji}</span>
              <span className="truncate max-w-[70px]">{categoria}</span>
            </Badge>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{tempo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}