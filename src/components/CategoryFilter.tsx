import { Button } from "@heroui/react";
import { useRef, useEffect, useState, useCallback } from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const timestampRef = useRef<number>(0);
  
  const allItems = ["Todas", ...categories];
  
  // Scroll inercial
  const inertialScroll = useCallback(() => {
    if (!scrollRef.current || Math.abs(velocityRef.current) < 0.1) {
      velocityRef.current = 0;
      isScrollingRef.current = false;
      return;
    }
    
    scrollRef.current.scrollLeft += velocityRef.current;
    velocityRef.current *= 0.95; // Fricção
    
    animationFrameRef.current = requestAnimationFrame(inertialScroll);
  }, []);
  
  // Handlers de toque otimizados
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    
    isScrollingRef.current = true;
    startXRef.current = e.touches[0].pageX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    velocityRef.current = 0;
    timestampRef.current = Date.now();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isScrollingRef.current || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startXRef.current) * 1.2; // Sensibilidade ajustada
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    
    // Calcula velocidade
    const now = Date.now();
    const deltaTime = now - timestampRef.current;
    if (deltaTime > 0) {
      velocityRef.current = (scrollLeftRef.current - walk - scrollRef.current.scrollLeft) / deltaTime;
    }
    timestampRef.current = now;
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    isScrollingRef.current = false;
    
    // Inicia scroll inercial se houver velocidade suficiente
    if (Math.abs(velocityRef.current) > 0.5) {
      animationFrameRef.current = requestAnimationFrame(inertialScroll);
    } else {
      velocityRef.current = 0;
    }
    
    // Snap to nearest button
    if (scrollRef.current) {
      setTimeout(() => {
        if (!scrollRef.current) return;
        
        const container = scrollRef.current;
        const buttons = container.querySelectorAll('button');
        const containerCenter = container.scrollLeft + container.clientWidth / 2;
        
        let closestButton: Element | null = null;
        let minDistance = Infinity;
        
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          const buttonCenter = rect.left + rect.width / 2 - container.getBoundingClientRect().left + container.scrollLeft;
          const distance = Math.abs(buttonCenter - containerCenter);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestButton = button;
          }
        });
        
        if (closestButton && scrollRef.current) {
          const rect = closestButton.getBoundingClientRect();
          const targetScroll = rect.left + rect.width / 2 - container.clientWidth / 2;
          
          scrollRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [inertialScroll]);
  
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    // Adiciona os listeners
    container.addEventListener('touchstart', handleTouchStart as any);
    container.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    container.addEventListener('touchend', handleTouchEnd as any);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart as any);
      container.removeEventListener('touchmove', handleTouchMove as any);
      container.removeEventListener('touchend', handleTouchEnd as any);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  // Ajusta o container para garantir que todos os botões sejam visíveis inicialmente
  useEffect(() => {
    const updateLayout = () => {
      if (!scrollRef.current || !containerRef.current) return;
      
      const container = scrollRef.current;
      const buttons = container.querySelectorAll('button');
      
      // Ajusta padding para melhor experiência
      const firstButton = buttons[0] as HTMLElement;
      const lastButton = buttons[buttons.length - 1] as HTMLElement;
      
      if (firstButton && lastButton) {
        const firstRect = firstButton.getBoundingClientRect();
        const lastRect = lastButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Adiciona padding para scroll suave
        const neededPadding = containerRect.width / 2 - firstRect.width / 2;
        container.style.paddingLeft = `${neededPadding}px`;
        container.style.paddingRight = `${neededPadding}px`;
      }
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
    
    return () => window.removeEventListener('resize', updateLayout);
  }, [categories]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden touch-pan-x"
      style={{
        minHeight: '56px',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div 
        ref={scrollRef}
        className="flex gap-3 pb-2 scroll-smooth"
        style={{
          width: '100%',
          height: '100%',
          padding: '16px 0',
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          // Para iOS smooth scrolling
          WebkitBackfaceVisibility: 'hidden',
          WebkitTransform: 'translate3d(0,0,0)',
        } as React.CSSProperties}
      >
        {allItems.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={selected === item ? "solid" : "bordered"}
            color={selected === item ? (item === "Todas" ? "primary" : "secondary") : "default"}
            onClick={() => onSelect(item)}
            className="text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0 touch-manipulation"
            style={{
              flexShrink: 0,
              minWidth: 'max-content',
              padding: '8px 20px',
              height: '40px',
              margin: '0 2px',
              // Otimizações de performance
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              // Melhora feedback tátil
              transition: 'transform 0.1s ease, opacity 0.1s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={(e) => {
              // Pequeno feedback visual
              e.currentTarget.style.opacity = '0.9';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {item}
          </Button>
        ))}
      </div>
      
      {/* CSS para scroll perfeito no mobile */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        
        /* Para scroll suave no iOS */
        @supports (-webkit-touch-callout: none) {
          .scroll-container {
            -webkit-overflow-scrolling: touch !important;
            overflow-scrolling: touch !important;
          }
        }
        
        /* Efeito de pressão nos botões */
        button:active {
          transform: scale(0.98) !important;
        }
      `}</style>
    </div>
  );
}