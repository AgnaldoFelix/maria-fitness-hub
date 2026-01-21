import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={selected === "Todas" ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect("Todas")}
        className={cn(
          "flex-shrink-0 rounded-full",
          selected === "Todas" && "bg-primary text-primary-foreground"
        )}
      >
        Todas
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(category)}
          className={cn(
            "flex-shrink-0 rounded-full",
            selected === category && "bg-secondary text-secondary-foreground"
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
