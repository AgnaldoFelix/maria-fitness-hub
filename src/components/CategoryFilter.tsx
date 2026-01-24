import { Button } from "@heroui/react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const allItems = ["Todas", ...categories];

  return (
    <div className="w-full overflow-hidden">
      <div
        className="
    flex gap-3 px-1 py-3 pr-[60px]
    overflow-x-auto overflow-y-hidden
    snap-x snap-mandatory
    touch-pan-x
  "
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {allItems.map((item) => (
          <div key={item} className="snap-center flex-shrink-0">
            <Button
              size=""
              variant={selected === item ? "solid" : "bordered"}
              color={
                selected === item
                  ? item === "Todas"
                    ? "primary"
                    : "secondary"
                  : "default"
              }
              onClick={() => onSelect(item)}
              className="
                rounded-full
                whitespace-nowrap
                px-3 h-7
                touch-manipulation
              "
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {item}
            </Button>
          </div>
        ))}
      </div>

      {/* remove scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
