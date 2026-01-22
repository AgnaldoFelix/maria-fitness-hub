import { ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background com blur leve */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm border-t border-border/20" />
      
      {/* Conteúdo */}
      <div className="relative z-10 text-center py-3 px-4">
        <p className="text-sm text-muted-foreground">
          Desenvolvido com <span className="text-red-500 mx-1">❤️</span> por{" "}
          <a 
            href="https://www.linkedin.com/in/agnaldofelix/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors group"
          >
            Agnaldo Felix
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          © {currentYear} Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}