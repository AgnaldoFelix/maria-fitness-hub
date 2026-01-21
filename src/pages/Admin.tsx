import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UtensilsCrossed, ShoppingBag, Edit, Trash2, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
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

  const formatForCanva = (recipe: Recipe) => {
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
  };

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
    <div className="min-h-screen bg-background pb-20">
      <Header title="Área Admin" subtitle="Gerenciar conteúdo" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="receitas" className="gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="produtos" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receitas" className="space-y-4">
            <Button 
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              onClick={handleNewRecipe}
            >
              <Plus className="w-4 h-4" />
              Nova Receita
            </Button>

            {recipesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-semibold text-foreground truncate">
                              {recipe.nome}
                            </h3>
                            {recipe.publicada ? (
                              <Eye className="w-4 h-4 text-success flex-shrink-0" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {recipe.categoria}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {recipe.tempo}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyForCanva(recipe)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditRecipe(recipe)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteRecipeId(recipe.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {recipes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma receita cadastrada.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="produtos" className="space-y-4">
            <Button 
              className="w-full gap-2 bg-success hover:bg-success/90"
              onClick={handleNewProduct}
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>

            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-success" />
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <Card key={product.id} className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-semibold text-foreground truncate">
                              {product.nome}
                            </h3>
                            {product.disponivel ? (
                              <Badge className="bg-success text-success-foreground text-xs">
                                Disponível
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Indisponível
                              </Badge>
                            )}
                          </div>
                          <span className="text-primary font-semibold">
                            {formatPrice(Number(product.preco))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteProductId(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum produto cadastrado.
                  </p>
                )}
              </div>
            )}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A receita será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecipe} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
