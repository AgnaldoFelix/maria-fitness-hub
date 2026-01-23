import { Button } from "@heroui/react";
import { useRef, useState, useEffect, TouchEvent } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartX = useRef(0);
  const allItems = ["Todas", ...categories];

  const checkScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const isAtStart = scrollLeft <= 5;
    const isAtEnd = Math.abs(scrollLeft + clientWidth - scrollWidth) <= 5;
    
    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    const scrollAmount = scrollRef.current.clientWidth * 0.7;
    const newScrollLeft = scrollRef.current.scrollLeft + 
      (direction === "right" ? scrollAmount : -scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth"
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      checkScroll();
    }, 300);
  };

  // Touch handlers para melhor controle
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!scrollRef.current) return;
    
    // Esconde setas durante o scroll manual
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    if (deltaX > 10) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(checkScroll, 100); // Reavalia após scroll manual
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    checkScroll();
    
    const handleScroll = () => {
      if (!isScrolling) checkScroll();
    };
    
    container.addEventListener("scroll", handleScroll);
    
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkScroll, 50);
    });
    resizeObserver.observe(container);
    
    // iOS specific: prevenir bounce effect
    const preventBounce = (e: TouchEvent) => {
      if (scrollRef.current && 
          scrollRef.current.scrollWidth > scrollRef.current.clientWidth) {
        if (e.cancelable) e.preventDefault();
      }
    };
    
    container.addEventListener('touchmove', preventBounce as any, { passive: false });
    
    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      container.removeEventListener('touchmove', preventBounce as any);
    };
  }, [categories, isScrolling]);

  return (
    <div className="relative -mx-4 px-4 touch-pan-x">
      {/* Container principal com scroll otimizado para touch */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {allItems.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={selected === item ? "solid" : "bordered"}
            color={selected === item ? (item === "Todas" ? "primary" : "secondary") : "default"}
            onClick={() => onSelect(item)}
            className="text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0 touch-manipulation active:scale-95 snap-start select-none"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Seta esquerda - otimizada para mobile */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          onTouchStart={(e) => {
            e.stopPropagation();
            scroll("left");
          }}
          className="absolute left-3 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm bg-black/5 active:bg-black/15 transition-all duration-150 touch-manipulation"
          aria-label="Rolar para esquerda"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Seta direita - otimizada para mobile */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          onTouchStart={(e) => {
            e.stopPropagation();
            scroll("right");
          }}
          className="absolute right-3 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm bg-black/5 active:bg-black/15 transition-all duration-150 touch-manipulation"
          aria-label="Rolar para direita"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Estilo para esconder scrollbar em todos os navegadores */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}