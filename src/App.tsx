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
import SucessoPage from "./pages/Successo";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AddressModal } from "./components/cart/AddressModal";



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
            onClick={() => window.location.href = '/receitas'}
          >
            Voltar para Receitas
          </Button>
        </div>
      </div>
    );
  }

  return <Admin />;
}

// Componente principal
function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1">
        <BrowserRouter>
          <Routes>
            <Route path="/receitas" element={<Receitas />} />
            <Route path="/" element={<Produtos />} />
            <Route path="/admin" element={<ProtectedAdminRoute />} />
            <Route path="/sucesso" element={<SucessoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </BrowserRouter>
      </main>

      {/* Carrinho lateral */}
      <CartDrawer />


    </div>
  );
}

// Componente principal da aplicação
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CheckoutProvider>
        <AppContent />
        <Toaster />
        <Sonner />
      </CheckoutProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;