// components/BottomNav.tsx - Versão ultra compacta
import { UtensilsCrossed, ShoppingBag, Settings, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Receitas",
    href: "/",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  {
    label: "Produtos",
    href: "/produtos",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
];

interface BottomNavProps {
  position?: 'fixed' | 'absolute' | 'sticky';
  className?: string;
}

export function BottomNav({ position = 'fixed', className }: BottomNavProps) {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <nav className={cn(
      "bottom-0 left-0 right-0 bg-card z-50",
      position === 'fixed' && "fixed",
      position === 'absolute' && "absolute",
      position === 'sticky' && "sticky",
      className
    )}>
      {/* Conteúdo principal + footer em uma única div */}
      <div className="max-w-lg mx-auto">
        {/* Navegação */}
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/admin"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
              location.pathname.startsWith("/admin")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Admin</span>
          </Link>
        </div>

        {/* Footer - linha única muito compacta */}
        <div className="border-t border-border/10">
          <div className="px-4 py-1 text-center">
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              <span className="inline-flex items-center gap-0.5">
                Desenvolvido com <span className="text-red-500 text-[8px]">❤️</span> por{" "}
                <a 
                  href="https://www.linkedin.com/in/agnaldofelix/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  Agnaldo Felix
                </a>
              </span>
              {" • "}© {currentYear}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}