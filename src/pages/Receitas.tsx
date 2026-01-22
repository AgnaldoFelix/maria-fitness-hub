import { useState, useMemo, useDeferredValue } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecipes, type Recipe } from "@/hooks/useRecipes";
import { Footer } from "@/components/Footer"; // Importe o Footer

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
    <div className="min-h-screen bg-background safe-pb">
      <Header subtitle="Receitas Fitness" />
      <Footer/>
      
      <main className="px-4 py-4 max-w-lg mx-auto flex-1">
        {/* Search */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm pb-4">
          <div className="relative">
            <BottomNav />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-base"
              aria-label="Buscar receitas"
            />
          </div>
       
        </div>
  
        {/* Category Filter */}
        <div className="mb-4 overflow-y-auto">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Recipes Grid */}
            {filteredRecipes.length > 0 ? (
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
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">Nenhuma receita encontrada</h3>
                <p className="text-muted-foreground">
                  {deferredSearch ? "Tente buscar com outros termos" : "Nenhuma receita cadastrada ainda"}
                </p>
              </div>
            )}
          </>
        )}


      </main>

      <RecipeModal
        recipe={selectedRecipe}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

 
      <Footer className="fixed bottom-0 left-0 right-0 z-50"/>
    </div>
  );
}