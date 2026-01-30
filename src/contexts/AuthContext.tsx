// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário temporário fixo
const TEMP_USER: User = {
  id: 'temp-user-id',
  email: import.meta.env.VITE_ADMIN_EMAIL || 'Mariafitness@email.com' ,
  app_metadata: { provider: 'email', role: 'admin' },
  user_metadata: { name: 'Admin' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as any;

// Sessão temporária fixa
const TEMP_SESSION: Session = {
  access_token: 'temp-token',
  refresh_token: 'temp-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600 * 1000,
  token_type: 'bearer',
  user: TEMP_USER,
} as any;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'SUPABASE' | 'TEMPORARY'>(
    import.meta.env.VITE_AUTH_MODE === 'TEMPORARY' ? 'TEMPORARY' : 'SUPABASE'
  );

  useEffect(() => {
    const initializeAuth = async () => {
      if (import.meta.env.VITE_BYPASS_AUTH === 'false') {
        // Modo bypass - autenticação automática
        console.log('🔓 Modo bypass ativado - autenticando automaticamente');
        setSession(TEMP_SESSION);
        setUser(TEMP_USER);
        setLoading(false);
        return;
      }

      if (authMode === 'TEMPORARY') {
        // Modo temporário - usar credenciais das envs
        console.log('🔐 Modo de autenticação temporária ativo');
        
        // Verificar se já tem sessão salva
        const savedSession = localStorage.getItem('temp_auth_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setSession(parsed.session);
          setUser(parsed.user);
        }
        
        setLoading(false);
      } else {
        // Modo Supabase normal
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
        } catch (error) {
          console.error('Erro ao obter sessão Supabase:', error);
        } finally {
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth event:', event);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      }
    };

    initializeAuth();
  }, [authMode]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentando login no modo:', authMode);
    
    if (authMode === 'TEMPORARY') {
      // Autenticação temporária com credenciais das envs
      const envEmail = import.meta.env.VITE_ADMIN_EMAIL || 'Mariafitness@email.com';
      const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'dia@21';
      
      console.log('📧 Email fornecido:', email);
      console.log('📧 Email esperado:', envEmail);
      
      if (email === envEmail && password === envPassword) {
        // Criar sessão temporária
        const tempSession = {
          ...TEMP_SESSION,
          user: {
            ...TEMP_USER,
            email: email,
          }
        };
        
        setSession(tempSession);
        setUser(tempSession.user);
        
        // Salvar no localStorage
        localStorage.setItem('temp_auth_session', JSON.stringify({
          session: tempSession,
          user: tempSession.user,
          timestamp: Date.now()
        }));
        
        toast.success(`✅ Login realizado como ${email}`);
        return { error: null };
      } else {
        console.error('❌ Credenciais incorretas');
        toast.error('Email ou senha incorretos');
        return { 
          error: new Error('Credenciais inválidas') 
        };
      }
    }
    
    // Modo Supabase normal
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Erro no login Supabase:', error);
        toast.error(error.message);
      } else {
        toast.success('Login realizado via Supabase');
      }
      
      return { error };
    } catch (error) {
      console.error('Exceção no login:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (authMode === 'TEMPORARY') {
      // No modo temporário, não permitir cadastro
      toast.info('Modo temporário ativo. Use as credenciais pré-definidas.');
      return { 
        error: new Error('Cadastro desativado no modo temporário') 
      };
    }
    
    // Modo Supabase normal
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: 'admin' }
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Conta criada! Confirme seu email.');
      }
      
      return { error };
    } catch (error) {
      console.error('Exceção no cadastro:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (authMode === 'TEMPORARY') {
      // Limpar sessão temporária
      setSession(null);
      setUser(null);
      localStorage.removeItem('temp_auth_session');
      toast.success('Logout realizado');
      return;
    }
    
    // Modo Supabase normal
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook para verificar se é admin (opcional)
export function useIsAdmin() {
  const { user } = useAuth();
  
  if (!user) return false;
  
  const adminEmails = [
    'Mariafitness@email.com',
    import.meta.env.VITE_ADMIN_EMAIL,
    'admin@bibielle.com'
  ].filter(Boolean);
  
  return adminEmails.includes(user.email || '');
}