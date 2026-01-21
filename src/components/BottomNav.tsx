import { UtensilsCrossed, ShoppingBag, Settings } from "lucide-react";
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

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
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
    </nav>
  );
}
