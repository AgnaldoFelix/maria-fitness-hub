import { Sparkles } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Maria Fitness", subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-center gap-2 h-16 px-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <div className="text-center">
          <h1 className="font-heading font-bold text-lg text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
    </header>
  );
}
