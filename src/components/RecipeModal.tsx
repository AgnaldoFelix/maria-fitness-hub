import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  ScrollShadow,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import {
  Share2,
  Clock,
  Utensils,
  ChefHat,
  Copy,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { type Recipe } from "@/hooks/useRecipes";

interface RecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function RecipeModal({ recipe, open, onClose }: RecipeModalProps) {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const whatsappNumero = settings?.whatsapp_numero || "5579996848609";

  if (!recipe) return null;

  // Função para quebrar texto longo automaticamente
  const autoBreakText = (text: string, maxLineLength = 60) => {
    if (!text) return "";

    // Dividir por quebras de linha existentes
    const lines = text.split("\n");

    const processedLines = lines.map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return "";

      // Se a linha já tem bullets ou números, manter o prefixo
      const hasBullet =
        trimmedLine.startsWith("•") || trimmedLine.startsWith("-");
      const hasNumber = /^\d+[\.\)]/.test(trimmedLine);

      let prefix = "";
      let content = trimmedLine;

      if (hasBullet) {
        prefix = trimmedLine.charAt(0) + " ";
        content = trimmedLine.slice(1).trim();
      } else if (hasNumber) {
        const match = trimmedLine.match(/^(\d+[\.\)]\s*)/);
        if (match) {
          prefix = match[0];
          content = trimmedLine.slice(match[0].length).trim();
        }
      }

      // Se a linha já é curta o suficiente, retornar como está
      if (content.length <= maxLineLength) {
        return prefix + content;
      }

      // Quebrar a linha em palavras
      const words = content.split(" ");
      const resultLines: string[] = [];
      let currentLine = prefix;

      words.forEach((word) => {
        // Se adicionando a palavra ultrapassa o limite e já temos algo na linha
        if (
          currentLine.length + word.length + 1 > maxLineLength &&
          currentLine !== prefix
        ) {
          resultLines.push(currentLine);
          currentLine = " ".repeat(prefix.length) + word; // Indentar as linhas subsequentes
        } else {
          // Adicionar espaço se não for o primeiro item da linha
          if (
            currentLine !== prefix &&
            currentLine !== " ".repeat(prefix.length)
          ) {
            currentLine += " ";
          }
          currentLine += word;
        }
      });

      // Adicionar a última linha
      if (currentLine) {
        resultLines.push(currentLine);
      }

      return resultLines.join("\n");
    });

    return processedLines.join("\n");
  };

  // Formatar ingredientes mantendo bullets
  const formatIngredients = (ingredients: string) => {
    const lines = ingredients.split("\n").filter((line) => line.trim());
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          return trimmed;
        }
        return `• ${trimmed}`;
      })
      .join("\n");
  };

  // Formatar modo de preparo com numeração e quebras automáticas
  const formatPreparation = (preparation: string) => {
    const steps = preparation.split("\n").filter((step) => step.trim());

    // Adicionar numeração se não existir
    const numberedSteps = steps.map((step, index) => {
      const trimmed = step.trim();
      // Se já começa com número, manter
      if (/^\d+[\.\)]/.test(trimmed)) {
        return trimmed;
      }
      return `${index + 1}. ${trimmed}`;
    });

    // Aplicar quebras automáticas a cada passo
    return numberedSteps.map((step) => autoBreakText(step, 60)).join("\n\n");
  };

  // Função para renderizar modo de preparo com quebras visuais
  const renderPreparationSteps = (preparation: string) => {
    const formatted = formatPreparation(preparation);
    const steps = formatted.split("\n\n");

    return steps.map((step, index) => {
      // Extrair número do passo se existir
      const stepNumberMatch = step.match(/^(\d+[\.\)])/);
      const stepNumber = stepNumberMatch ? stepNumberMatch[1] : `${index + 1}.`;
      const stepContent = stepNumberMatch
        ? step.slice(stepNumberMatch[0].length).trim()
        : step;

      return (
        <div
          key={index}
          className="bg-gradient-to-r from-background to-muted/20 rounded-lg p-4 border border-muted/50"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
              {stepNumber}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                {autoBreakText(stepContent, 55)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleShareWhatsApp = () => {
    const ingredientsFormatted = formatIngredients(recipe.ingredientes);
    const preparationFormatted = formatPreparation(recipe.modo_preparo);

    const message = `🍽️ *${recipe.nome}*\n\n📋 *Ingredientes:*\n${ingredientsFormatted}\n\n👩‍🍳 *Modo de Preparo:*\n${preparationFormatted}\n\n⏱️ *Tempo:* ${recipe.tempo}\n\n✨ Receita por Maria Fitness`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleCopyRecipe = async () => {
    const ingredientsFormatted = formatIngredients(recipe.ingredientes);
    const preparationFormatted = formatPreparation(recipe.modo_preparo);

    const recipeText = `🍽️ ${recipe.nome}\n\n📋 Ingredientes:\n${ingredientsFormatted}\n\n👩‍🍳 Modo de Preparo:\n${preparationFormatted}\n\n⏱️ Tempo: ${recipe.tempo}\n\n✨ Receita por Maria Fitness`;

    try {
      await navigator.clipboard.writeText(recipeText);
      toast({
        title: "Receita copiada! 📋",
        description: "A receita foi copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a receita.",
        variant: "destructive",
      });
    }
  };

  const handleContact = () => {
    const message = `Olá Maria! Tenho uma dúvida sobre a receita "${recipe.nome}". Poderia me ajudar?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${whatsappNumero}?text=${encodedMessage}`,
      "_blank",
    );
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={onClose}
      size="lg"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "max-h-[90vh] bg-background", // ✅ 90vh em vez de 50vh
        closeButton: "top-2 right-2",
        backdrop: "bg-black/50",
        wrapper: "pb-20", // ✅ Espaço para BottomNav
      }}
    >
      <ModalContent className="bg-background">
        <ModalHeader className="flex flex-col gap-1 bg-background">
          <h2 className="text-lg font-semibold truncate">{recipe.nome}</h2>
        </ModalHeader>

        <ScrollShadow 
        hideScrollBar 
        className="w-full h-full max-h-[55vh]">
          <ModalBody className="gap-6 pb-6 bg-background">
            {/* Imagem da receita */}
            {recipe.foto_url && (
              <div className="w-full rounded-lg overflow-hidden bg-default-100 aspect-video flex items-center justify-center">
                {!imageLoaded && !imageError && (
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
                {imageError ? (
                  <div className="w-full h-64 flex flex-col items-center justify-center gap-2 bg-default-200">
                    <span className="text-4xl">📷</span>
                    <p className="text-sm text-default-500">
                      Imagem não disponível
                    </p>
                  </div>
                ) : (
                  <img
                    src={recipe.foto_url}
                    alt={recipe.nome}
                    className={`w-full h-64 object-cover transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0 absolute"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(true);
                    }}
                  />
                )}
              </div>
            )}

            {/* Meta informações */}
            <div className="flex items-center gap-3 flex-wrap">
              <Chip
                color="secondary"
                variant="flat"
                className="text-sm py-1.5 px-3 gap-1"
              >
                <span className="text-base">
                  {getCategoryEmoji(recipe.categoria)}
                </span>
                <span>{recipe.categoria}</span>
              </Chip>
              <div className="flex items-center gap-1.5 text-default-500 text-sm bg-default-100 rounded-full py-1.5 px-3">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{recipe.tempo}</span>
              </div>
            </div>

            <Divider />

            {/* Ingredientes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Ingredientes</h3>
              </div>
              <Card className="bg-default-50">
                <CardBody className="gap-0">
                  <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words font-medium">
                    {autoBreakText(formatIngredients(recipe.ingredientes), 60)}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Modo de Preparo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Modo de Preparo</h3>
              </div>
              <div className="space-y-3">
                {renderPreparationSteps(recipe.modo_preparo)}
              </div>
            </div>

            {/* Dicas e Observações */}
            {recipe.observacoes && (
              <>
                <Divider />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <h3 className="font-semibold text-lg">Dicas</h3>
                  </div>
                  <Card className="bg-warning/10 border border-warning/30">
                    <CardBody>
                      <p className="text-sm text-warning-600 leading-relaxed whitespace-pre-wrap break-words">
                        {autoBreakText(recipe.observacoes, 60)}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
          </ModalBody>
        </ScrollShadow>

        <Divider />

        <ModalFooter className="flex-col gap-3 bg-background">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="bordered"
              className="gap-2"
              onClick={handleCopyRecipe}
              startContent={<Copy className="w-4 h-4" />}
            >
              Copiar
            </Button>
            <Button
              color="success"
              className="gap-2"
              onClick={handleShareWhatsApp}
              startContent={<Share2 className="w-4 h-4" />}
            >
              Compartilhar
            </Button>
          </div>

          <Button
            variant="bordered"
            className="w-full gap-2"
            onClick={handleContact}
            startContent={<MessageCircle className="w-4 h-4" />}
          >
            Tirar dúvida sobre esta receita
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2 border-t w-full">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
              <img
                src="/day.png"
                alt="Maria Fitness"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-default-500">
              Receita por{" "}
              <span className="font-medium text-primary">Maria Fitness</span> ✨
            </p>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const getCategoryEmoji = (category: string) => {
  const emojiMap: Record<string, string> = {
    "Café da Manhã": "☀️",
    Lanche: "🥪",
    "Doce Fit": "🍫",
    "Low Carb": "🥗",
    Proteico: "💪",
    Almoço: "🍽️",
    Jantar: "🌙",
  };
  return emojiMap[category] || "🍽️";
};
