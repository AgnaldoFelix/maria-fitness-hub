import { Button } from "@heroui/react";
import { useRef, useEffect } from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const allItems = ["Todas", ...categories];
  
  // Garantir que o scroll funcione no mobile
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Forçar a exibição da barra de scroll se necessário
    const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
    
    if (hasHorizontalScroll) {
      // Adicionar evento de touch para scroll horizontal
      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        const startX = touch.pageX;
        const scrollLeft = container.scrollLeft;
        
        const handleTouchMove = (e: TouchEvent) => {
          const touch = e.touches[0];
          const x = touch.pageX;
          const walk = (x - startX) * 2; // Fator de velocidade
          container.scrollLeft = scrollLeft - walk;
        };
        
        const handleTouchEnd = () => {
          container.removeEventListener('touchmove', handleTouchMove);
          container.removeEventListener('touchend', handleTouchEnd);
        };
        
        container.addEventListener('touchmove', handleTouchMove);
        container.addEventListener('touchend', handleTouchEnd);
      };
      
      container.addEventListener('touchstart', handleTouchStart);
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [categories]);

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 px-4 scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          // Estilos para garantir scroll no mobile
          overflowX: 'scroll',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          // Remover qualquer limitação de altura
          minHeight: '60px',
          alignItems: 'center',
          // Forçar scroll horizontal
          touchAction: 'pan-x',
        } as React.CSSProperties}
      >
        {allItems.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={selected === item ? "solid" : "bordered"}
            color={selected === item ? (item === "Todas" ? "primary" : "secondary") : "default"}
            onClick={() => onSelect(item)}
            className="text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0"
            style={{
              // Garantir que os botões não encolham
              flexShrink: 0,
              minWidth: 'max-content',
              // Melhorar experiência de toque no mobile
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {item}
          </Button>
        ))}
      </div>
      
      {/* Estilos para garantir scroll no mobile */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        
        /* Forçar scroll horizontal em dispositivos móveis */
        @media (max-width: 768px) {
          .scroll-container {
            -webkit-overflow-scrolling: touch !important;
            overflow-scrolling: touch !important;
            overscroll-behavior-x: contain;
          }
        }
      `}</style>
    </div>
  );
}