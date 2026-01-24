import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useUpdateProductDiscount, useRemoveProductDiscount } from "@/hooks/useDiscounts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Percent, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DiscountManager() {
  const { toast } = useToast();
  const { data: products = [], isLoading } = useProducts(false);
  const updateDiscount = useUpdateProductDiscount();
  const removeDiscount = useRemoveProductDiscount();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    desconto_percentual: 0,
    data_desconto_inicio: "",
    data_desconto_fim: "",
  });

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setFormData({
      desconto_percentual: product.desconto_percentual || 0,
      data_desconto_inicio: product.data_desconto_inicio?.split("T")[0] || "",
      data_desconto_fim: product.data_desconto_fim?.split("T")[0] || "",
    });
  };

  const handleSaveDiscount = async (product: any) => {
    if (formData.desconto_percentual < 0 || formData.desconto_percentual > 100) {
      toast({
        title: "Desconto inválido",
        description: "O desconto deve estar entre 0% e 100%",
        variant: "destructive",
      });
      return;
    }

    if (!formData.data_desconto_inicio || !formData.data_desconto_fim) {
      toast({
        title: "Datas obrigatórias",
        description: "Selecione as datas de início e fim do desconto",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDiscount.mutateAsync({
        productId: product.id,
        discountData: {
          desconto_percentual: formData.desconto_percentual,
          desconto_ativo: true,
          preco_original: product.preco,
          data_desconto_inicio: `${formData.data_desconto_inicio}T00:00:00`,
          data_desconto_fim: `${formData.data_desconto_fim}T23:59:59`,
        },
      });

      toast({
        title: "✅ Desconto aplicado!",
        description: `Desconto de ${formData.desconto_percentual}% ativado para ${product.nome}`,
      });

      setEditingProductId(null);
    } catch (error: any) {
      toast({
        title: "Erro ao aplicar desconto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveDiscount = async (product: any) => {
    try {
      await removeDiscount.mutateAsync(product.id);
      toast({
        title: "✅ Desconto removido!",
        description: `Desconto removido de ${product.nome}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover desconto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Gerenciador de Descontos
          </CardTitle>
          <CardDescription>
            Aplique e controle descontos nos produtos. Os descontos aparecerão com uma insígnia na loja.
          </CardDescription>
        </CardHeader>
      </Card>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                {editingProductId === product.id ? (
                  // Modo Edição
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{product.nome}</h3>
                      <p className="text-sm text-muted-foreground">{product.descricao}</p>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Preço Original:</span>
                        <span className="font-semibold">{formatPrice(product.preco)}</span>
                      </div>
                      {formData.desconto_percentual > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Preço com Desconto:</span>
                          <span className="font-semibold text-success">
                            {formatPrice(
                              calculateDiscountedPrice(product.preco, formData.desconto_percentual)
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.desconto_percentual}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              desconto_percentual: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Data Início</Label>
                        <Input
                          type="date"
                          value={formData.data_desconto_inicio}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              data_desconto_inicio: e.target.value,
                            })
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Data Fim</Label>
                        <Input
                          type="date"
                          value={formData.data_desconto_fim}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              data_desconto_fim: e.target.value,
                            })
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleSaveDiscount(product)}
                        className="flex-1 gap-2 bg-success hover:bg-success/90"
                        disabled={updateDiscount.isPending}
                      >
                        {updateDiscount.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Save className="w-4 h-4" />
                        Aplicar
                      </Button>
                      <Button
                        onClick={() => setEditingProductId(null)}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo Visualização
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{product.nome}</h3>
                        {product.desconto_ativo && product.desconto_percentual > 0 && (
                          <Badge className="bg-red-100 text-red-700 gap-1">
                            <Percent className="w-3 h-3" />
                            {product.desconto_percentual}%
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{product.descricao}</p>

                      <div className="space-y-1">
                        {product.desconto_ativo && product.desconto_percentual > 0 ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Preço Original:</span>
                              <span className="text-sm line-through text-muted-foreground">
                                {formatPrice(product.preco_original || product.preco)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Preço Atual:</span>
                              <span className="font-bold text-lg text-success">
                                {formatPrice(
                                  calculateDiscountedPrice(
                                    product.preco_original || product.preco,
                                    product.desconto_percentual
                                  )
                                )}
                              </span>
                            </div>
                            {product.data_desconto_fim && (
                              <div className="text-xs text-muted-foreground pt-1">
                                Até {format(new Date(product.data_desconto_fim), "dd 'de' MMMM", { locale: ptBR })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Preço:</span>
                            <span className="font-semibold">{formatPrice(product.preco)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleEditClick(product)}
                        variant="outline"
                        size="sm"
                        className="gap-1"
                      >
                        <Percent className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      {product.desconto_ativo && product.desconto_percentual > 0 && (
                        <Button
                          onClick={() => handleRemoveDiscount(product)}
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          disabled={removeDiscount.isPending}
                        >
                          {removeDiscount.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remover</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}