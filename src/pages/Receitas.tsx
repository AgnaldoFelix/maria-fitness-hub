import { useState, useMemo, useDeferredValue } from "react";
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
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: recipes = [], isLoading } = useRecipes(true);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = selectedCategory === "Todas" || recipe.categoria === selectedCategory;
      const matchesSearch = deferredSearch ? 
        recipe.nome.toLowerCase().includes(deferredSearch.toLowerCase()) : true;
      return matchesCategory && matchesSearch;
    });
  }, [recipes, selectedCategory, deferredSearch]);

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Receitas Fitness" />

      <main className="flex-1 flex flex-col px-3 max-w-lg mx-auto w-full">
        {/* Search and Filter - Fixed at top */}
        <div className="search-section sticky top-16 z-30 bg-background/95 backdrop-blur-sm pt-3 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-base"
              aria-label="Buscar receitas"
            />
          </div>
       
          {/* Category Filter */}
          <div className="w-full">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </div>

        {/* Cards Container with Scroll */}
        <div className="flex-1">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Recipes Grid with Scroll */}
              {filteredRecipes.length > 0 ? (
                <div className="overflow-y-auto pb-20">
                  <div className="grid grid-cols-2 gap-2.5 pb-4">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        id={recipe.id}
                        nome={recipe.nome}
                        categoria={recipe.categoria}
                        tempo={recipe.tempo}
                        foto_url={recipe.foto_url || ""}
                        onClick={() => handleRecipeClick(recipe)}
                        className="h-full" // Garante que o card preencha a altura
                      />
                    ))}
                  </div>
                  
                  {/* Mostrar contagem de receitas */}
                  <div className="mt-2 mb-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                  <div className="text-center px-4 max-w-xs">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-base mb-2">Nenhuma receita encontrada</h3>
                    <p className="text-sm text-muted-foreground">
                      {deferredSearch 
                        ? "Tente buscar com outros termos" 
                        : "Nenhuma receita cadastrada ainda"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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