import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Receitas from "./pages/Receitas";
import Produtos from "./pages/Produtos";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { useIPAuth } from "@/hooks/ipUtils";
import { Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { NotificationPopup } from "@/components/NotificationPopup";
// import { useNotificationPopup } from "@/hooks/useNotificationPopup";

const queryClient = new QueryClient();

// Componente wrapper para proteger a rota Admin
function ProtectedAdminRoute() {
  const { isAllowed, loading } = useIPAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Esta área só pode ser acessada a partir de dispositivos autorizados.
            Entre em contato com o administrador se precisar de acesso.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            Voltar para Receitas
          </Button>
        </div>
      </div>
    );
  }

  return <Admin />;
}

function AppContent() {
  // const { isOpen, currentNotification, closePopup } = useNotificationPopup();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/receitas" element={<Receitas />} />
          <Route path="/" element={<Produtos />} />
          <Route path="/admin" element={<ProtectedAdminRoute />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      {/* <NotificationPopup
        notification={currentNotification!}
        isOpen={isOpen}
        onClose={closePopup}
      /> */}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;