import { Button } from "@heroui/react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const allItems = ["Todas", ...categories];
  
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {allItems.map((item) => (
        <Button
          key={item}
          size="sm"
          variant={selected === item ? "solid" : "bordered"}
          color={selected === item ? (item === "Todas" ? "primary" : "secondary") : "default"}
          onClick={() => onSelect(item)}
          className="text-xs sm:text-sm font-medium rounded-lg w-full"
        >
          {item}
        </Button>
      ))}
    </div>
  );
}