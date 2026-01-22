import { useState, useMemo, useDeferredValue, useEffect } from "react";
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
  const [containerHeight, setContainerHeight] = useState("calc(100vh - 280px)");

  const { data: recipes = [], isLoading } = useRecipes(true);

  useEffect(() => {
    // Função para calcular altura dinâmica
    const calculateHeight = () => {
      const header = document.querySelector('header');
      const searchSection = document.querySelector('.search-section');
      const bottomNav = document.querySelector('nav');
      
      if (header && searchSection && bottomNav) {
        const headerHeight = header.offsetHeight;
        const searchHeight = searchSection.offsetHeight;
        const bottomNavHeight = bottomNav.offsetHeight;
        
        const totalHeight = headerHeight + searchHeight + bottomNavHeight + 32; // + padding extra
        const calculatedHeight = `calc(100vh - ${totalHeight}px)`;
        setContainerHeight(calculatedHeight);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

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

      <main className="flex-1 flex flex-col px-4 max-w-lg mx-auto">
        {/* Search and Filter - Fixed at top */}
        <div className="search-section sticky top-16 z-30 bg-background/95 backdrop-blur-sm pt-4 pb-4 space-y-3">
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
          <div className="w-full overflow-x-auto">
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
                <div 
                  className="overflow-y-auto" 
                  style={{ height: containerHeight }}
                >
                  <div className="grid grid-cols-2 gap-3 pb-4">
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
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center" 
                  style={{ height: containerHeight }}
                >
                  <div className="text-center px-4">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">Nenhuma receita encontrada</h3>
                    <p className="text-muted-foreground">
                      {deferredSearch ? "Tente buscar com outros termos" : "Nenhuma receita cadastrada ainda"}
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