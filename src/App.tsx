import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Receitas from "./pages/Receitas";
import Produtos from "./pages/Produtos";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import SucessoPage from "./pages/Successo";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PixModal } from "./components/checkout/PixModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente wrapper para proteger a rota Admin com autenticação
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Componente para rotas públicas que redirecionam se já estiver autenticado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Componente principal
function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/receitas" element={<Receitas />} />
        <Route path="/" element={<Produtos />} />
        <Route path="/sucesso" element={<SucessoPage />} />
        
        {/* Rota de login - pública, mas redireciona se já estiver autenticado */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        {/* Rota admin - protegida por autenticação */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        
        {/* Rota para página não encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Carrinho lateral */}
      <CartDrawer />
          <PixModal /> {/* Apenas aqui, uma vez */}
    </BrowserRouter>
  );
}

// Componente principal da aplicação
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CheckoutProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </CheckoutProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;