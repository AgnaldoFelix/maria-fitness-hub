import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecipes, type Recipe } from "@/hooks/useRecipes";

const categories = ["Café da Manhã", "Lanche", "Doce Fit", "Low Carb", "Proteico"];

export default function Receitas() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: recipes = [], isLoading } = useRecipes(true);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory = selectedCategory === "Todas" || recipe.categoria === selectedCategory;
    const matchesSearch = recipe.nome.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header subtitle="Receitas Fitness" />
      
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Recipes Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                nome={recipe.nome}
                categoria={recipe.categoria}
                tempo={recipe.tempo}
                foto_url={recipe.foto_url || ""}
                onClick={() => handleRecipeClick(recipe)}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredRecipes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma receita encontrada.</p>
          </div>
        )}
      </main>

      <RecipeModal
        recipe={selectedRecipe}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
