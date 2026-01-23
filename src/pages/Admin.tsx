import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UtensilsCrossed, ShoppingBag, Edit, Trash2, Copy, Eye, EyeOff, Loader2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useRecipes, useDeleteRecipe, type Recipe } from "@/hooks/useRecipes";
import { useProducts, useDeleteProduct, type Product } from "@/hooks/useProducts";
import { RecipeFormDialog } from "@/components/RecipeFormDialog";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NotificationManager } from "@/components/NotificationManager";

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("receitas");
  
  // Recipe state
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);
  
  // Product state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { data: recipes = [], isLoading: recipesLoading } = useRecipes(false);
  const { data: products = [], isLoading: productsLoading } = useProducts(false);
  
  const deleteRecipeMutation = useDeleteRecipe();
  const deleteProductMutation = useDeleteProduct();

  const formatForCanva = useCallback((recipe: Recipe) => {
    const emojiMap: Record<string, string> = {
      "Café da Manhã": "☀️",
      "Lanche": "🥪",
      "Doce Fit": "🍫",
      "Low Carb": "🥗",
      "Proteico": "💪",
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
  }, []);

  const handleCopyForCanva = async (recipe: Recipe) => {
    const formattedText = formatForCanva(recipe);
    await navigator.clipboard.writeText(formattedText);
    toast({
      title: "Copiado! ✨",
      description: "Receita formatada para o Canva.",
    });
  };

  const handleDeleteRecipe = async () => {
    if (!deleteRecipeId) return;
    try {
      await deleteRecipeMutation.mutateAsync(deleteRecipeId);
      toast({ title: "Receita excluída com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao excluir receita", variant: "destructive" });
    }
    setDeleteRecipeId(null);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProductMutation.mutateAsync(deleteProductId);
      toast({ title: "Produto excluído com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao excluir produto", variant: "destructive" });
    }
    setDeleteProductId(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setRecipeDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleNewRecipe = () => {
    setEditingRecipe(null);
    setRecipeDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background safe-pb">
      <Header title="Área Administrativa" subtitle="Gerenciar conteúdo" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="receitas" className="gap-2 text-sm">
              <UtensilsCrossed className="w-4 h-4" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="produtos" className="gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="popup" className="gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Popup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receitas" className="space-y-4">
            <Button 
              className="w-full gap-2 bg-primary hover:bg-primary/90 h-11 text-base"
              onClick={handleNewRecipe}
            >
              <Plus className="w-5 h-5" />
              Nova Receita
            </Button>

            {recipesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[60vh]">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} className="animate-fade-in">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate text-sm">
                              {recipe.nome}
                            </h3>
                            <div className="flex-shrink-0">
                              {recipe.publicada ? (
                                <Eye className="w-4 h-4 text-success" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {recipe.categoria}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {recipe.tempo}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyForCanva(recipe)}
                            title="Copiar para Canva"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditRecipe(recipe)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteRecipeId(recipe.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {recipes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma receita cadastrada.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="produtos" className="space-y-4">
            <Button 
              className="w-full gap-2 bg-success hover:bg-success/90 h-11 text-base"
              onClick={handleNewProduct}
            >
              <Plus className="w-5 h-5" />
              Novo Produto
            </Button>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-success" />
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[60vh]">
                {products.map((product) => (
                  <Card key={product.id} className="animate-fade-in">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate text-sm">
                              {product.nome}
                            </h3>
                            <Badge className={`text-xs px-1.5 py-0 ${product.disponivel ? 'bg-success text-success-foreground' : ''}`}>
                              {product.disponivel ? 'Disponível' : 'Indisponível'}
                            </Badge>
                          </div>
                          <span className="text-primary font-semibold text-sm">
                            {formatPrice(Number(product.preco))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteProductId(product.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popup" className="space-y-4">
            <NotificationManager />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      {/* Recipe Form Dialog */}
      <RecipeFormDialog
        open={recipeDialogOpen}
        onOpenChange={setRecipeDialogOpen}
        recipe={editingRecipe}
      />

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
      />

      {/* Delete Recipe Confirmation */}
      <AlertDialog open={!!deleteRecipeId} onOpenChange={() => setDeleteRecipeId(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Excluir receita?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Esta ação não pode ser desfeita. A receita será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRecipe} 
              className="bg-destructive hover:bg-destructive/90 h-10"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct} 
              className="bg-destructive hover:bg-destructive/90 h-10"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}