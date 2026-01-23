import { Button } from "@heroui/react";
import { useRef } from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const allItems = ["Todas", ...categories];
  
  return (
    <div 
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth scrollbar-hide"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      } as React.CSSProperties}
    >
      {allItems.map((item) => (
        <Button
          key={item}
          isIconOnly={false}
          size="sm"
          variant={selected === item ? "solid" : "bordered"}
          color={selected === item ? (item === "Todas" ? "primary" : "secondary") : "default"}
          onClick={() => onSelect(item)}
          className="text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0"
        >
          {item}
        </Button>
      ))}
    </div>
  );
}