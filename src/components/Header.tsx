import { Sparkles } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Maria Fitness", subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border supports-[backdrop-filter]:bg-card/60 ">
      <div className="flex items-center justify-center gap-3 h-16 px-4 ">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src="/day.png"
            alt="Maria Fitness"
            className="w-10 h-10 object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="font-heading font-bold text-lg text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
      </div>
    </header>
  );
}