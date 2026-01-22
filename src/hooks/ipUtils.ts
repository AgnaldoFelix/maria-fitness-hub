// utils/ipUtils.ts
// Função para obter o IP do usuário usando um serviço externo
export async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erro ao obter IP:', error);
    // Fallback: tenta outro serviço
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

// Lista de IPs autorizados (coloque os IPs dos celulares específicos aqui)
export const ALLOWED_IPS = [
  '192.168.1.100', // Exemplo: IP do seu celular na rede WiFi
  '192.168.1.101', // Exemplo: IP de outro celular autorizado
  '10.0.0.50',     // Exemplo para rede 10.x.x.x
  '162.120.186.80',
  '189.96.25.228',
//   '177.37.183.200',
  // Adicione quantos IPs necessários
];

// Função para verificar se o IP atual está autorizado
export async function isIPAllowed(): Promise<boolean> {
  // Em desenvolvimento, sempre permite (ou pode desativar)
  if (process.env.NODE_ENV === 'development') {
    return true; // Ou false, dependendo da sua preferência
  }

  try {
    const userIP = await getUserIP();
    console.log('IP detectado:', userIP); // Apenas para debug
    
    // Verifica se o IP está na lista de autorizados
    return ALLOWED_IPS.includes(userIP);
  } catch (error) {
    console.error('Erro na verificação de IP:', error);
    return false; // Em caso de erro, nega o acesso
  }
}

// Hook React para verificar IP
import { useState, useEffect } from 'react';

export function useIPAuth() {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIP = async () => {
      setLoading(true);
      try {
        const allowed = await isIPAllowed();
        setIsAllowed(allowed);
      } catch (error) {
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkIP();
  }, []);

  return { isAllowed, loading };
}