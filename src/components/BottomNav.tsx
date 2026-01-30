import { UtensilsCrossed, ShoppingBag, Settings, ExternalLink } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const currentYear = new Date().getFullYear();

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className={cn(
      "bottom-0 left-0 right-0 bg-card z-50",
      position === 'fixed' && "fixed",
      position === 'absolute' && "absolute",
      position === 'sticky' && "sticky",
      className
    )}>
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
          
          {/* Botão Admin - Redireciona para login se não autenticado */}
          <button
            onClick={handleAdminClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
              (location.pathname === '/admin' || location.pathname === '/login')
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            disabled={loading}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">
              {loading ? "..." : "Admin"}
            </span>
          </button>
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