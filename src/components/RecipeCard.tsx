import { Clock, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  id: string;
  nome: string;
  categoria: string;
  tempo: string;
  foto_url: string;
  onClick: () => void;
}

export function RecipeCard({ nome, categoria, tempo, foto_url, onClick }: RecipeCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={foto_url || "/placeholder.svg"}
          alt={nome}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <Badge 
          className="absolute top-3 left-3 bg-secondary text-secondary-foreground font-medium"
        >
          {categoria}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-heading font-semibold text-foreground line-clamp-2 mb-2">
          {nome}
        </h3>
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{tempo}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>Receita</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
