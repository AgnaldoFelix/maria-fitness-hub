import { UtensilsCrossed, ShoppingBag, Settings, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIPAuth } from "@/hooks/ipUtils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Receitas",
    href: "/receitas",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  {
    label: "Produtos",
    href: "/",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
];

interface BottomNavProps {
  position?: 'fixed' | 'absolute' | 'sticky';
  className?: string;
}

export function BottomNav({ position = 'fixed', className }: BottomNavProps) {
  const location = useLocation();
  const { isAllowed, loading } = useIPAuth();
  const currentYear = new Date().getFullYear();

  return (
    <nav className={cn(
      "bottom-0 left-0 right-0 bg-card z-50",
      position === 'fixed' && "fixed",
      position === 'absolute' && "absolute",
      position === 'sticky' && "sticky",
      className
    )}>
      <div className="max-w-lg mx-auto ">
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
          
          {/* Só mostra Admin se o IP estiver autorizado */}
          {!loading && isAllowed && (
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
          )}
          
          {/* Opção: Mostrar um botão desativado ou mensagem para IPs não autorizados */}
          {!loading && !isAllowed && (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-2 opacity-50 cursor-not-allowed">
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Admin</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/10">
          <div className="px-4 py-1 text-center">
            <p className="text-[12px] text-muted-foreground/60 leading-tight">
              <span className="inline-flex items-center gap-0.5">
                Desenvolvido<span className="text-red-500 text-[20px]"></span> por{" "}
                <a 
                  href="https://www.linkedin.com/in/agnaldofelix/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary font-bold hover:underline"
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